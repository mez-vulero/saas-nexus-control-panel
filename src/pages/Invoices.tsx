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
import { FileText, Plus, Search, Calendar, DollarSign, User, Receipt, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fetchInvoices = async () => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('issued_at', { ascending: false });
  if (error) throw error;
  return data;
};

const createInvoice = async (invoice) => {
  const { data, error } = await supabase.from('invoices').insert([invoice]).select().single();
  if (error) throw error;
  return data;
};

const updateInvoice = async ({ id, ...invoice }) => {
  const { data, error } = await supabase.from('invoices').update(invoice).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

const deleteInvoice = async (id) => {
  const { error } = await supabase.from('invoices').delete().eq('id', id);
  if (error) throw error;
  return id;
};

const Invoices = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  const [form, setForm] = useState({ user_id: '', subscription_id: '', amount: '', status: '', issued_at: '', paid_at: '' });
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: invoices = [], isLoading, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: fetchInvoices,
  });

  // Add filter state for all major columns
  const [columnFilters, setColumnFilters] = useState({
    user_id: '',
    subscription_id: '',
    amount: '',
    status: '',
    issued_at: '',
    paid_at: '',
  });

  // Update filteredInvoices to use columnFilters
  const filteredInvoices = invoices.filter((inv) => {
    const matchesUserId = !columnFilters.user_id || (inv.user_id && inv.user_id.toString().includes(columnFilters.user_id));
    const matchesSubscriptionId = !columnFilters.subscription_id || (inv.subscription_id && inv.subscription_id.toString().includes(columnFilters.subscription_id));
    const matchesAmount = !columnFilters.amount || (inv.amount && inv.amount.toString().includes(columnFilters.amount));
    const matchesStatus = !columnFilters.status || (inv.status && inv.status.toLowerCase().includes(columnFilters.status.toLowerCase()));
    const matchesIssuedAt = !columnFilters.issued_at || (inv.issued_at && inv.issued_at.startsWith(columnFilters.issued_at));
    const matchesPaidAt = !columnFilters.paid_at || (inv.paid_at && inv.paid_at.startsWith(columnFilters.paid_at));
    return matchesUserId && matchesSubscriptionId && matchesAmount && matchesStatus && matchesIssuedAt && matchesPaidAt;
  });

  // Add sorting state
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Sort filteredInvoices
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    let aValue, bValue;
    if (sortBy === 'amount') {
      aValue = Number(a.amount) || 0;
      bValue = Number(b.amount) || 0;
    } else {
      aValue = a.issued_at || '';
      bValue = b.issued_at || '';
    }
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const createMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setModalOpen(false);
      setForm({ user_id: '', subscription_id: '', amount: '', status: '', issued_at: '', paid_at: '' });
      toast({ title: 'Invoice created' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message }),
  });

  const updateMutation = useMutation({
    mutationFn: updateInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setModalOpen(false);
      setEditInvoice(null);
      setForm({ user_id: '', subscription_id: '', amount: '', status: '', issued_at: '', paid_at: '' });
      toast({ title: 'Invoice updated' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setDeleteId(null);
      toast({ title: 'Invoice deleted' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message }),
  });

  const openAdd = () => {
    setEditInvoice(null);
    setForm({ user_id: '', subscription_id: '', amount: '', status: '', issued_at: '', paid_at: '' });
    setModalOpen(true);
  };
  const openEdit = (inv) => {
    setEditInvoice(inv);
    setForm({
      user_id: inv.user_id || '',
      subscription_id: inv.subscription_id || '',
      amount: inv.amount || '',
      status: inv.status || '',
      issued_at: inv.issued_at ? inv.issued_at.slice(0, 16) : '',
      paid_at: inv.paid_at ? inv.paid_at.slice(0, 16) : '',
    });
    setModalOpen(true);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editInvoice) {
      updateMutation.mutate({ id: editInvoice.id, ...form });
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
              placeholder="Search invoices..."
              value={columnFilters.user_id}
              onChange={(e) => setColumnFilters({ ...columnFilters, user_id: e.target.value })}
              className="pl-8"
            />
          </div>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button className="shrink-0" onClick={openAdd}>
                <Plus className="mr-2 h-4 w-4" /> Add Invoice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editInvoice ? 'Edit Invoice' : 'Add Invoice'}</DialogTitle>
                <DialogDescription>
                  {editInvoice ? 'Edit the details for this invoice.' : 'Enter the details for the new invoice.'}
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
                  <Label htmlFor="subscription_id" className="text-right">
                    Subscription ID
                  </Label>
                  <Input id="subscription_id" className="col-span-3" value={form.subscription_id} onChange={(e) => setForm({ ...form, subscription_id: e.target.value })} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input id="amount" className="col-span-3" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Input id="status" className="col-span-3" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="issued_at" className="text-right">
                    Issued At
                  </Label>
                  <Input id="issued_at" className="col-span-3" type="datetime-local" value={form.issued_at} onChange={(e) => setForm({ ...form, issued_at: e.target.value })} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="paid_at" className="text-right">
                    Paid At
                  </Label>
                  <Input id="paid_at" className="col-span-3" type="datetime-local" value={form.paid_at} onChange={(e) => setForm({ ...form, paid_at: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleSubmit}>Save Invoice</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {/* Advanced Filters */}
        <div className="flex flex-wrap gap-2 mb-4 flex-col sm:flex-row">
          <div className="relative w-full sm:w-40">
            <Label htmlFor="filter-status" className="text-xs absolute left-2 top-1">Status</Label>
            <Select value={columnFilters.status} onValueChange={v => setColumnFilters(f => ({ ...f, status: v }))}>
              <SelectTrigger className="mt-5 w-full"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Sorting UI */}
        <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
          <label>Sort by:</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border px-2 py-1 rounded w-full sm:w-auto">
            <option value="date">Date</option>
            <option value="amount">Amount</option>
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
              <TableHead><FileText className="inline mr-1 h-4 w-4" />ID</TableHead>
              <TableHead><User className="inline mr-1 h-4 w-4" />User ID</TableHead>
              <TableHead><Receipt className="inline mr-1 h-4 w-4" />Subscription ID</TableHead>
              <TableHead><DollarSign className="inline mr-1 h-4 w-4" />Amount</TableHead>
              <TableHead><Badge className="inline mr-1 h-4 w-4" />Status</TableHead>
              <TableHead><Calendar className="inline mr-1 h-4 w-4" />Issued At</TableHead>
              <TableHead><Calendar className="inline mr-1 h-4 w-4" />Paid At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              sortedInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>{inv.id}</TableCell>
                  <TableCell>{inv.user_id}</TableCell>
                  <TableCell>{inv.subscription_id}</TableCell>
                  <TableCell>{inv.amount}</TableCell>
                  <TableCell>{inv.status}</TableCell>
                  <TableCell>{new Date(inv.issued_at).toLocaleString()}</TableCell>
                  <TableCell>{inv.paid_at ? new Date(inv.paid_at).toLocaleString() : '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => openEdit(inv)}><Pencil className="h-4 w-4 mr-1" />Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(inv.id)}><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
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

export default Invoices; 