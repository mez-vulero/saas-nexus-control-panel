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
import { UserCog, Plus, Search, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from 'react';

const fetchRoles = async () => {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('id', { ascending: true });
  if (error) throw error;
  return data;
};

const createRole = async (role) => {
  const { data, error } = await supabase.from('roles').insert([role]).select().single();
  if (error) throw error;
  return data;
};

const updateRole = async ({ id, ...role }) => {
  const { data, error } = await supabase.from('roles').update(role).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

const deleteRole = async (id) => {
  const { error } = await supabase.from('roles').delete().eq('id', id);
  if (error) throw error;
  return id;
};

const Roles = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [form, setForm] = useState({ name: '' });
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Add filter state for all major columns
  const [columnFilters, setColumnFilters] = useState({
    name: '',
  });

  // Add sorting state
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { data: roles = [], isLoading, error } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
  });

  // Update filteredRoles to use columnFilters
  const filteredRoles = roles.filter((role) => {
    const matchesName = !columnFilters.name || role.name.toLowerCase().includes(columnFilters.name.toLowerCase());
    return matchesName;
  });

  // Sort filteredRoles
  const sortedRoles = [...filteredRoles].sort((a, b) => {
    const aValue = a.name?.toLowerCase() || '';
    const bValue = b.name?.toLowerCase() || '';
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setModalOpen(false);
      setForm({ name: '' });
      toast({ title: 'Role created' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message }),
  });

  const updateMutation = useMutation({
    mutationFn: updateRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setModalOpen(false);
      setEditRole(null);
      setForm({ name: '' });
      toast({ title: 'Role updated' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setDeleteId(null);
      toast({ title: 'Role deleted' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message }),
  });

  const openAdd = () => {
    setEditRole(null);
    setForm({ name: '' });
    setModalOpen(true);
  };
  const openEdit = (role) => {
    setEditRole(role);
    setForm({ name: role.name });
    setModalOpen(true);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editRole) {
      updateMutation.mutate({ id: editRole.id, ...form });
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
              placeholder="Search roles..."
              value={columnFilters.name}
              onChange={(e) => setColumnFilters({ ...columnFilters, name: e.target.value })}
              className="pl-8 w-full"
            />
          </div>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button className="shrink-0 w-full sm:w-auto" onClick={openAdd}>
                <Plus className="mr-2 h-4 w-4" /> Add Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editRole ? 'Edit Role' : 'Add Role'}</DialogTitle>
                <DialogDescription>
                  {editRole ? 'Edit the details for this role.' : 'Enter the details for the new role.'}
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
                <Button type="submit" onClick={handleSubmit}>Save Role</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {/* Sorting UI */}
        <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
          <label>Sort by:</label>
          <span>Name</span>
          <button type="button" onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')} className="border px-2 py-1 rounded flex items-center gap-1 w-full sm:w-auto">
            {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            {sortOrder === 'asc' ? 'Asc' : 'Desc'}
          </button>
        </div>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[400px]">
          <TableHeader>
            <TableRow>
              <TableHead><UserCog className="inline mr-1 h-4 w-4" />ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                  No roles found
                </TableCell>
              </TableRow>
            ) : (
              sortedRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>{role.id}</TableCell>
                  <TableCell>{role.name}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => openEdit(role)}><Pencil className="h-4 w-4 mr-1" />Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(role.id)}><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
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

export default Roles; 