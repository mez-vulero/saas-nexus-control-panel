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
import { ListChecks, User, FileText, Database, Hash, Calendar, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from 'react';

const fetchAuditLogs = async () => {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

const createLog = async (log) => {
  const { data, error } = await supabase.from('audit_logs').insert([log]).select().single();
  if (error) throw error;
  return data;
};

const updateLog = async ({ id, ...log }) => {
  const { data, error } = await supabase.from('audit_logs').update(log).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

const deleteLog = async (id) => {
  const { error } = await supabase.from('audit_logs').delete().eq('id', id);
  if (error) throw error;
  return id;
};

const AuditLogs = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editLog, setEditLog] = useState(null);
  const [form, setForm] = useState({ user_id: '', action: '', entity_type: '', entity_id: '', details: '', created_at: '' });
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: logs = [], isLoading, error } = useQuery({
    queryKey: ['audit_logs'],
    queryFn: fetchAuditLogs,
  });

  // Add filter state for all major columns
  const [columnFilters, setColumnFilters] = useState({
    user_id: '',
    action: '',
    entity_type: '',
    entity_id: '',
    created_at: '',
  });

  // Add sorting state
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Update filteredLogs to use columnFilters
  const filteredLogs = logs.filter((log) => {
    const matchesUserId = !columnFilters.user_id || (log.user_id && log.user_id.toString().includes(columnFilters.user_id));
    const matchesAction = !columnFilters.action || (log.action && log.action.toLowerCase().includes(columnFilters.action.toLowerCase()));
    const matchesEntityType = !columnFilters.entity_type || (log.entity_type && log.entity_type.toLowerCase().includes(columnFilters.entity_type.toLowerCase()));
    const matchesEntityId = !columnFilters.entity_id || (log.entity_id && log.entity_id.toString().includes(columnFilters.entity_id));
    const matchesCreatedAt = !columnFilters.created_at || (log.created_at && log.created_at.startsWith(columnFilters.created_at));
    return matchesUserId && matchesAction && matchesEntityType && matchesEntityId && matchesCreatedAt;
  });

  // Sort filteredLogs
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    const aValue = a.created_at || '';
    const bValue = b.created_at || '';
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const createMutation = useMutation({
    mutationFn: createLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
      setModalOpen(false);
      setForm({ user_id: '', action: '', entity_type: '', entity_id: '', details: '', created_at: '' });
      toast({ title: 'Log created' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message }),
  });

  const updateMutation = useMutation({
    mutationFn: updateLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
      setModalOpen(false);
      setEditLog(null);
      setForm({ user_id: '', action: '', entity_type: '', entity_id: '', details: '', created_at: '' });
      toast({ title: 'Log updated' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
      setDeleteId(null);
      toast({ title: 'Log deleted' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message }),
  });

  const openAdd = () => {
    setEditLog(null);
    setForm({ user_id: '', action: '', entity_type: '', entity_id: '', details: '', created_at: '' });
    setModalOpen(true);
  };
  const openEdit = (log) => {
    setEditLog(log);
    setForm({
      user_id: log.user_id || '',
      action: log.action || '',
      entity_type: log.entity_type || '',
      entity_id: log.entity_id || '',
      details: log.details ? JSON.stringify(log.details) : '',
      created_at: log.created_at ? log.created_at.slice(0, 16) : '',
    });
    setModalOpen(true);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const details = form.details ? JSON.parse(form.details) : null;
    if (editLog) {
      updateMutation.mutate({ id: editLog.id, ...form, details });
    } else {
      createMutation.mutate({ ...form, details });
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
                Add Log
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editLog ? 'Edit Log' : 'Add Log'}</DialogTitle>
                <DialogDescription>
                  {editLog ? 'Edit the details for this log.' : 'Enter the details for the new log.'}
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
                  <Label htmlFor="action" className="text-right">
                    Action
                  </Label>
                  <Input id="action" className="col-span-3" value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="entity_type" className="text-right">
                    Entity Type
                  </Label>
                  <Input id="entity_type" className="col-span-3" value={form.entity_type} onChange={(e) => setForm({ ...form, entity_type: e.target.value })} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="entity_id" className="text-right">
                    Entity ID
                  </Label>
                  <Input id="entity_id" className="col-span-3" value={form.entity_id} onChange={(e) => setForm({ ...form, entity_id: e.target.value })} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="details" className="text-right">
                    Details (JSON)
                  </Label>
                  <Input id="details" className="col-span-3" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="created_at" className="text-right">
                    Created At
                  </Label>
                  <Input id="created_at" className="col-span-3" type="datetime-local" value={form.created_at} onChange={(e) => setForm({ ...form, created_at: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleSubmit}>Save Log</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {/* Advanced Filters */}
        <div className="flex flex-wrap gap-2 mb-4 flex-col sm:flex-row">
          <div className="relative w-full sm:w-32">
            <User className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="User ID" value={columnFilters.user_id} onChange={e => setColumnFilters(f => ({ ...f, user_id: e.target.value }))} className="pl-8 w-full" />
          </div>
          <div className="relative w-full sm:w-32">
            <FileText className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Action" value={columnFilters.action} onChange={e => setColumnFilters(f => ({ ...f, action: e.target.value }))} className="pl-8 w-full" />
          </div>
          <div className="relative w-full sm:w-32">
            <Database className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Entity Type" value={columnFilters.entity_type} onChange={e => setColumnFilters(f => ({ ...f, entity_type: e.target.value }))} className="pl-8 w-full" />
          </div>
          <div className="relative w-full sm:w-32">
            <Hash className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Entity ID" value={columnFilters.entity_id} onChange={e => setColumnFilters(f => ({ ...f, entity_id: e.target.value }))} className="pl-8 w-full" />
          </div>
          <div className="relative w-full sm:w-40">
            <Calendar className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input type="date" placeholder="Created At" value={columnFilters.created_at} onChange={e => setColumnFilters(f => ({ ...f, created_at: e.target.value }))} className="pl-8 w-full" />
          </div>
        </div>
        {/* Sorting UI */}
        <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
          <label>Sort by:</label>
          <span>Date</span>
          <button type="button" onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')} className="border px-2 py-1 rounded flex items-center gap-1 w-full sm:w-auto">
            {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            {sortOrder === 'asc' ? 'Asc' : 'Desc'}
          </button>
        </div>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead><ListChecks className="inline mr-1 h-4 w-4" />ID</TableHead>
              <TableHead><User className="inline mr-1 h-4 w-4" />User ID</TableHead>
              <TableHead><FileText className="inline mr-1 h-4 w-4" />Action</TableHead>
              <TableHead><Database className="inline mr-1 h-4 w-4" />Entity Type</TableHead>
              <TableHead><Hash className="inline mr-1 h-4 w-4" />Entity ID</TableHead>
              <TableHead>Details</TableHead>
              <TableHead><Calendar className="inline mr-1 h-4 w-4" />Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  No audit logs found
                </TableCell>
              </TableRow>
            ) : (
              sortedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.id}</TableCell>
                  <TableCell>{log.user_id}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.entity_type}</TableCell>
                  <TableCell>{log.entity_id}</TableCell>
                  <TableCell>{log.details ? JSON.stringify(log.details) : '-'}</TableCell>
                  <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => openEdit(log)}><Pencil className="h-4 w-4 mr-1" />Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(log.id)}><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
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

export default AuditLogs; 