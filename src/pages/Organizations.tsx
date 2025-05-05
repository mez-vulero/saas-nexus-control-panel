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
import { Building2, Plus, Search, Calendar, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from 'react';

const fetchOrganizations = async () => {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

const createOrganization = async (org) => {
  const { data, error } = await supabase.from('organizations').insert([org]).select().single();
  if (error) throw error;
  return data;
};

const updateOrganization = async ({ id, ...org }) => {
  const { data, error } = await supabase.from('organizations').update(org).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

const deleteOrganization = async (id) => {
  const { error } = await supabase.from('organizations').delete().eq('id', id);
  if (error) throw error;
  return id;
};

const Organizations = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editOrg, setEditOrg] = useState(null);
  const [form, setForm] = useState({ name: '' });
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: organizations = [], isLoading, error } = useQuery({
    queryKey: ['organizations'],
    queryFn: fetchOrganizations,
  });

  // Add filter state for all major columns
  const [columnFilters, setColumnFilters] = useState({
    name: '',
    created_at: '',
  });

  // Update filteredOrganizations to use columnFilters
  const filteredOrganizations = organizations.filter((org) => {
    const matchesName = !columnFilters.name || org.name.toLowerCase().includes(columnFilters.name.toLowerCase());
    const matchesCreatedAt = !columnFilters.created_at || (org.created_at && org.created_at.startsWith(columnFilters.created_at));
    return matchesName && matchesCreatedAt;
  });

  // Add sorting state
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Sort filteredOrganizations
  const sortedOrganizations = [...filteredOrganizations].sort((a, b) => {
    let aValue, bValue;
    if (sortBy === 'name') {
      aValue = a.name?.toLowerCase() || '';
      bValue = b.name?.toLowerCase() || '';
    } else {
      aValue = a.created_at || '';
      bValue = b.created_at || '';
    }
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const createMutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setModalOpen(false);
      setForm({ name: '' });
      toast({ title: 'Organization created' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message }),
  });

  const updateMutation = useMutation({
    mutationFn: updateOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setModalOpen(false);
      setEditOrg(null);
      setForm({ name: '' });
      toast({ title: 'Organization updated' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setDeleteId(null);
      toast({ title: 'Organization deleted' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message }),
  });

  const openAdd = () => {
    setEditOrg(null);
    setForm({ name: '' });
    setModalOpen(true);
  };
  const openEdit = (org) => {
    setEditOrg(org);
    setForm({ name: org.name });
    setModalOpen(true);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editOrg) {
      updateMutation.mutate({ id: editOrg.id, ...form });
    } else {
      createMutation.mutate(form);
    }
  };
  const handleDelete = (id) => setDeleteId(id);
  const confirmDelete = () => deleteMutation.mutate(deleteId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              value={columnFilters.name}
              onChange={(e) => setColumnFilters({ ...columnFilters, name: e.target.value })}
              className="pl-8"
            />
          </div>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button className="shrink-0" onClick={openAdd}>
                <Plus className="mr-2 h-4 w-4" /> Add Organization
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editOrg ? 'Edit Organization' : 'Add Organization'}</DialogTitle>
                <DialogDescription>
                  {editOrg ? 'Edit the details for this organization.' : 'Enter the details for the new organization.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input id="name" className="col-span-3" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleSubmit}>Save Organization</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {/* Advanced Filters */}
        <div className="flex flex-wrap gap-2 mb-4 flex-col sm:flex-row">
          <div className="relative w-full sm:w-40">
            <Label htmlFor="filter-name" className="text-xs absolute left-2 top-1">Name</Label>
            <Input placeholder="Name" value={columnFilters.name} onChange={e => setColumnFilters(f => ({ ...f, name: e.target.value }))} className="pl-8 mt-5 w-full" />
          </div>
          <div className="relative w-full sm:w-40">
            <Label htmlFor="filter-created-at" className="text-xs absolute left-2 top-1">Created At</Label>
            <Input type="date" placeholder="Created At" value={columnFilters.created_at} onChange={e => setColumnFilters(f => ({ ...f, created_at: e.target.value }))} className="pl-8 mt-5 w-full" />
          </div>
        </div>
        {/* Sorting UI */}
        <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
          <label>Sort by:</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border px-2 py-1 rounded w-full sm:w-auto">
            <option value="name">Name</option>
            <option value="date">Date</option>
          </select>
          <button type="button" onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')} className="border px-2 py-1 rounded flex items-center gap-1 w-full sm:w-auto">
            {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            {sortOrder === 'asc' ? 'Asc' : 'Desc'}
          </button>
        </div>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead><Building2 className="inline mr-1 h-4 w-4" />ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead><Calendar className="inline mr-1 h-4 w-4" />Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrganizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                  No organizations found
                </TableCell>
              </TableRow>
            ) : (
              sortedOrganizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>{org.id}</TableCell>
                  <TableCell>{org.name}</TableCell>
                  <TableCell>{new Date(org.created_at).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => openEdit(org)}><Pencil className="h-4 w-4 mr-1" />Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(org.id)}><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
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

export default Organizations; 