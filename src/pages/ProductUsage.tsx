import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Activity, User, Package, FileText, Calendar, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from 'react';

const fetchProductUsage = async () => {
  const { data, error } = await supabase
    .from('product_usage')
    .select('*')
    .order('occurred_at', { ascending: false });
  if (error) throw error;
  return data;
};

const createUsage = async (usage) => {
  const { data, error } = await supabase.from('product_usage').insert([usage]).select().single();
  if (error) throw error;
  return data;
};

const updateUsage = async ({ id, ...usage }) => {
  const { data, error } = await supabase.from('product_usage').update(usage).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

const deleteUsage = async (id) => {
  const { error } = await supabase.from('product_usage').delete().eq('id', id);
  if (error) throw error;
  return id;
};

const ProductUsage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editUsage, setEditUsage] = useState(null);
  const [form, setForm] = useState({ user_id: '', product_id: '', event_type: '', event_data: '', occurred_at: '' });
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Add filter state for all major columns
  const [columnFilters, setColumnFilters] = useState({
    user_id: '',
    product_id: '',
    event_type: '',
    occurred_at: '',
  });

  // Add sorting state
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { data: usage = [], isLoading, error } = useQuery({
    queryKey: ['product_usage'],
    queryFn: fetchProductUsage,
  });

  // Update filteredUsage to use columnFilters
  const filteredUsage = usage.filter((u) => {
    const matchesUserId = !columnFilters.user_id || (u.user_id && u.user_id.toString().includes(columnFilters.user_id));
    const matchesProductId = !columnFilters.product_id || (u.product_id && u.product_id.toString().includes(columnFilters.product_id));
    const matchesEventType = !columnFilters.event_type || (u.event_type && u.event_type.toLowerCase().includes(columnFilters.event_type.toLowerCase()));
    const matchesOccurredAt = !columnFilters.occurred_at || (u.occurred_at && u.occurred_at.startsWith(columnFilters.occurred_at));
    return matchesUserId && matchesProductId && matchesEventType && matchesOccurredAt;
  });

  // Sort filteredUsage
  const sortedUsage = [...filteredUsage].sort((a, b) => {
    const aValue = a.occurred_at || '';
    const bValue = b.occurred_at || '';
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const createMutation = useMutation({
    mutationFn: createUsage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product_usage'] });
      setModalOpen(false);
      setForm({ user_id: '', product_id: '', event_type: '', event_data: '', occurred_at: '' });
      toast({ title: 'Usage event created' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message }),
  });

  const updateMutation = useMutation({
    mutationFn: updateUsage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product_usage'] });
      setModalOpen(false);
      setEditUsage(null);
      setForm({ user_id: '', product_id: '', event_type: '', event_data: '', occurred_at: '' });
      toast({ title: 'Usage event updated' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUsage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product_usage'] });
      setDeleteId(null);
      toast({ title: 'Usage event deleted' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message }),
  });

  const openAdd = () => {
    setEditUsage(null);
    setForm({ user_id: '', product_id: '', event_type: '', event_data: '', occurred_at: '' });
    setModalOpen(true);
  };
  const openEdit = (u) => {
    setEditUsage(u);
    setForm({
      user_id: u.user_id || '',
      product_id: u.product_id || '',
      event_type: u.event_type || '',
      event_data: u.event_data ? JSON.stringify(u.event_data) : '',
      occurred_at: u.occurred_at ? u.occurred_at.slice(0, 16) : '',
    });
    setModalOpen(true);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const eventData = form.event_data ? JSON.parse(form.event_data) : null;
    if (editUsage) {
      updateMutation.mutate({ id: editUsage.id, ...form, event_data: eventData });
    } else {
      createMutation.mutate({ ...form, event_data: eventData });
    }
  };
  const handleDelete = (id) => setDeleteId(id);
  const confirmDelete = () => deleteMutation.mutate(deleteId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button className="shrink-0" onClick={openAdd}>
                Add Usage Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editUsage ? 'Edit Usage Event' : 'Add Usage Event'}</DialogTitle>
                <DialogDescription>
                  {editUsage ? 'Edit the details for this usage event.' : 'Enter the details for the new usage event.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="user_id" className="text-right">
                    User ID
                  </Label>
                  <Input id="user_id" className="col-span-3" value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="product_id" className="text-right">
                    Product ID
                  </Label>
                  <Input id="product_id" className="col-span-3" value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event_type" className="text-right">
                    Event Type
                  </Label>
                  <Input id="event_type" className="col-span-3" value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event_data" className="text-right">
                    Event Data (JSON)
                  </Label>
                  <Input id="event_data" className="col-span-3" value={form.event_data} onChange={(e) => setForm({ ...form, event_data: e.target.value })} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="occurred_at" className="text-right">
                    Occurred At
                  </Label>
                  <Input id="occurred_at" className="col-span-3" type="datetime-local" value={form.occurred_at} onChange={(e) => setForm({ ...form, occurred_at: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleSubmit}>Save Usage Event</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {/* Advanced Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative w-32">
            <User className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="User ID" value={columnFilters.user_id} onChange={e => setColumnFilters(f => ({ ...f, user_id: e.target.value }))} className="pl-8" />
          </div>
          <div className="relative w-32">
            <Package className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Product ID" value={columnFilters.product_id} onChange={e => setColumnFilters(f => ({ ...f, product_id: e.target.value }))} className="pl-8" />
          </div>
          <div className="relative w-32">
            <FileText className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Event Type" value={columnFilters.event_type} onChange={e => setColumnFilters(f => ({ ...f, event_type: e.target.value }))} className="pl-8" />
          </div>
          <div className="relative w-40">
            <Calendar className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input type="date" placeholder="Occurred At" value={columnFilters.occurred_at} onChange={e => setColumnFilters(f => ({ ...f, occurred_at: e.target.value }))} className="pl-8" />
          </div>
        </div>
        {/* Sorting UI */}
        <div className="flex items-center gap-2 mb-4">
          <label>Sort by:</label>
          <span>Date</span>
          <button type="button" onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')} className="border px-2 py-1 rounded flex items-center gap-1">
            {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            {sortOrder === 'asc' ? 'Asc' : 'Desc'}
          </button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Activity className="inline mr-1 h-4 w-4" />ID</TableHead>
              <TableHead><User className="inline mr-1 h-4 w-4" />User ID</TableHead>
              <TableHead><Package className="inline mr-1 h-4 w-4" />Product ID</TableHead>
              <TableHead><FileText className="inline mr-1 h-4 w-4" />Event Type</TableHead>
              <TableHead>Event Data</TableHead>
              <TableHead><Calendar className="inline mr-1 h-4 w-4" />Occurred At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsage.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  No product usage found
                </TableCell>
              </TableRow>
            ) : (
              sortedUsage.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>{u.user_id}</TableCell>
                  <TableCell>{u.product_id}</TableCell>
                  <TableCell>{u.event_type}</TableCell>
                  <TableCell>{u.event_data ? JSON.stringify(u.event_data) : '-'}</TableCell>
                  <TableCell>{new Date(u.occurred_at).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => openEdit(u)}><Pencil className="h-4 w-4 mr-1" />Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(u.id)}><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProductUsage; 