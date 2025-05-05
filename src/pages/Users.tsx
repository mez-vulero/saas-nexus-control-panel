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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { User, Mail, Plus, Search, Filter, Phone, CheckCheck, X, User as UserIcon, Calendar, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";

// Define the User type to fix TypeScript errors
interface UserSubscription {
  productName: string;
  [key: string]: any; // For other properties in the subscription
}

interface User {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  lastLogin: string;
  subscriptions?: UserSubscription[]; // Include subscriptions property
  phone?: string; // Include phone property
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString();
};

const fetchUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  // Map snake_case to camelCase for createdAt and lastLogin
  return (data || []).map(user => ({
    ...user,
    createdAt: user.created_at,
    lastLogin: user.last_login,
  }));
};

const createUser = async (user) => {
  const { data, error } = await supabase.from('users').insert([user]).select().single();
  if (error) throw error;
  return data;
};

const updateUser = async ({ id, ...user }) => {
  const { data, error } = await supabase.from('users').update(user).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

const deleteUser = async (id) => {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) throw error;
  return id;
};

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    email: "",
    product: "",
    phone: "",
    status: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', status: 'active', phone: '' });
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Add filter state for all major columns
  const [columnFilters, setColumnFilters] = useState({
    name: '',
    email: '',
    status: '',
    phone: '',
    createdAt: '',
    lastLogin: '',
  });

  // Add sorting state
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  // Get unique product names from users
  const products = Array.from(
    new Set(users.flatMap((user) => user.subscriptions?.map(sub => sub.productName) || []))
  ).filter(Boolean);

  // Update filteredUsers to use 'all' as no filter
  const filteredUsers = users.filter((user) => {
    const matchesName = !columnFilters.name || user.name.toLowerCase().includes(columnFilters.name.toLowerCase());
    const matchesEmail = !columnFilters.email || user.email.toLowerCase().includes(columnFilters.email.toLowerCase());
    const matchesStatus = filters.status === "all" || !filters.status || user.status === filters.status;
    const matchesPhone = !columnFilters.phone || (user.phone && user.phone.includes(columnFilters.phone));
    const matchesCreatedAt = !columnFilters.createdAt || (user.createdAt && user.createdAt.startsWith(columnFilters.createdAt));
    const matchesLastLogin = !columnFilters.lastLogin || (user.lastLogin && user.lastLogin.startsWith(columnFilters.lastLogin));
    const matchesProduct = filters.product === "all" || !filters.product || (user.subscriptions && user.subscriptions.some(sub => sub.productName === filters.product));
    return matchesName && matchesEmail && matchesStatus && matchesPhone && matchesCreatedAt && matchesLastLogin && matchesProduct;
  });

  // Sort filteredUsers
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue, bValue;
    if (sortBy === 'name') {
      aValue = a.name?.toLowerCase() || '';
      bValue = b.name?.toLowerCase() || '';
    } else {
      aValue = a.createdAt || '';
      bValue = b.createdAt || '';
    }
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      email: "",
      product: "",
      phone: "",
      status: "",
    });
  };

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setModalOpen(false);
      setForm({ name: '', email: '', status: 'active', phone: '' });
      toast({ title: 'User created' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message }),
  });

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setModalOpen(false);
      setEditUser(null);
      setForm({ name: '', email: '', status: 'active', phone: '' });
      toast({ title: 'User updated' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteId(null);
      toast({ title: 'User deleted' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message }),
  });

  const openAdd = () => {
    setEditUser(null);
    setForm({ name: '', email: '', status: 'active', phone: '' });
    setModalOpen(true);
  };
  const openEdit = (user) => {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, status: user.status, phone: user.phone || '' });
    setModalOpen(true);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editUser) {
      updateMutation.mutate({ id: editUser.id, ...form });
    } else {
      createMutation.mutate(form);
    }
  };
  const handleDelete = (id) => setDeleteId(id);
  const confirmDelete = () => deleteMutation.mutate(deleteId);

  // Add loading and error UI
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading users...</div>;
  }
  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-500">Error loading users: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
        </div>
        {/* Filter Bar (replaces DropdownMenu) */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4">
          <div className="relative w-full sm:w-40">
            <Label htmlFor="filter-email" className="text-xs absolute left-2 top-1">Email</Label>
            <Input
              id="filter-email"
              placeholder="Filter by email"
              value={filters.email}
              onChange={(e) => setFilters({ ...filters, email: e.target.value })}
              className="mt-5 w-full"
            />
          </div>
          <div className="relative w-full sm:w-40">
            <Label htmlFor="filter-product" className="text-xs absolute left-2 top-1">Product</Label>
            <Select
              value={filters.product}
              onValueChange={(value) => setFilters({ ...filters, product: value })}
            >
              <SelectTrigger id="filter-product" className="mt-5 w-full">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All products</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product} value={product}>
                    {product}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative w-full sm:w-40">
            <Label htmlFor="filter-phone" className="text-xs absolute left-2 top-1">Phone</Label>
            <Input
              id="filter-phone"
              placeholder="Filter by phone"
              value={filters.phone}
              onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
              className="mt-5 w-full"
            />
          </div>
          <div className="relative w-full sm:w-40">
            <Label htmlFor="filter-status" className="text-xs absolute left-2 top-1">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger id="filter-status" className="mt-5 w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            onClick={resetFilters}
            className="h-10 mt-5 w-full sm:w-auto"
            disabled={!activeFilterCount}
          >
            <X className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>
        {/* Filter chips/tags display */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {filters.email && (
              <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
                <CheckCheck className="h-3 w-3" />
                Email: {filters.email}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setFilters({ ...filters, email: "" })}
                />
              </Badge>
            )}
            {filters.product && (
              <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
                <CheckCheck className="h-3 w-3" />
                Product: {filters.product}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setFilters({ ...filters, product: "" })}
                />
              </Badge>
            )}
            {filters.phone && (
              <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
                <CheckCheck className="h-3 w-3" />
                Phone: {filters.phone}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setFilters({ ...filters, phone: "" })}
                />
              </Badge>
            )}
            {filters.status && (
              <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
                <CheckCheck className="h-3 w-3" />
                Status: {filters.status}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setFilters({ ...filters, status: "" })}
                />
              </Badge>
            )}
          </div>
        )}
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead><UserIcon className="inline mr-1 h-4 w-4" />User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead><Calendar className="inline mr-1 h-4 w-4" />Created</TableHead>
              <TableHead><Calendar className="inline mr-1 h-4 w-4" />Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              sortedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.status === "active"
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>{formatDate(user.lastLogin)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => openEdit(user)}><Pencil className="h-4 w-4 mr-1" />Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(user.id)}><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
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

export default Users;
