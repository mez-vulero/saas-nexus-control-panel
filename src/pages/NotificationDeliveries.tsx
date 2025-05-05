import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
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
import { Bell, User, Calendar, BadgeCheck, Search, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from 'react';

const fetchNotificationDeliveries = async () => {
  const { data, error } = await supabase
    .from('notification_deliveries')
    .select('*')
    .order('delivered_at', { ascending: false });
  if (error) throw error;
  return data;
};

const NotificationDeliveries = () => {
  const { data: deliveries = [], isLoading, error } = useQuery({
    queryKey: ['notification_deliveries'],
    queryFn: fetchNotificationDeliveries,
  });

  // Add filter state for all major columns
  const [columnFilters, setColumnFilters] = useState({
    notification_id: '',
    user_id: '',
    delivered_at: '',
    opened_at: '',
    status: '',
  });

  // Update filteredDeliveries to use columnFilters
  const filteredDeliveries = deliveries.filter((d) => {
    const matchesNotificationId = !columnFilters.notification_id || (d.notification_id && d.notification_id.toString().includes(columnFilters.notification_id));
    const matchesUserId = !columnFilters.user_id || (d.user_id && d.user_id.toString().includes(columnFilters.user_id));
    const matchesDeliveredAt = !columnFilters.delivered_at || (d.delivered_at && d.delivered_at.startsWith(columnFilters.delivered_at));
    const matchesOpenedAt = !columnFilters.opened_at || (d.opened_at && d.opened_at.startsWith(columnFilters.opened_at));
    const matchesStatus = !columnFilters.status || (d.status && d.status.toLowerCase().includes(columnFilters.status.toLowerCase()));
    return matchesNotificationId && matchesUserId && matchesDeliveredAt && matchesOpenedAt && matchesStatus;
  });

  // Add sorting state
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Sort filteredDeliveries
  const sortedDeliveries = [...filteredDeliveries].sort((a, b) => {
    const aValue = a.delivered_at || '';
    const bValue = b.delivered_at || '';
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        {/* Advanced Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative w-40">
            <Bell className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Notification ID" value={columnFilters.notification_id} onChange={e => setColumnFilters(f => ({ ...f, notification_id: e.target.value }))} className="pl-8" />
          </div>
          <div className="relative w-40">
            <User className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="User ID" value={columnFilters.user_id} onChange={e => setColumnFilters(f => ({ ...f, user_id: e.target.value }))} className="pl-8" />
          </div>
          <div className="relative w-40">
            <Calendar className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input type="date" placeholder="Delivered At" value={columnFilters.delivered_at} onChange={e => setColumnFilters(f => ({ ...f, delivered_at: e.target.value }))} className="pl-8" />
          </div>
          <div className="relative w-40">
            <Calendar className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input type="date" placeholder="Opened At" value={columnFilters.opened_at} onChange={e => setColumnFilters(f => ({ ...f, opened_at: e.target.value }))} className="pl-8" />
          </div>
          <div className="relative w-32">
            <BadgeCheck className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Status" value={columnFilters.status} onChange={e => setColumnFilters(f => ({ ...f, status: e.target.value }))} className="pl-8" />
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
              <TableHead><Bell className="inline mr-1 h-4 w-4" />ID</TableHead>
              <TableHead>Notification ID</TableHead>
              <TableHead><User className="inline mr-1 h-4 w-4" />User ID</TableHead>
              <TableHead><Calendar className="inline mr-1 h-4 w-4" />Delivered At</TableHead>
              <TableHead><Calendar className="inline mr-1 h-4 w-4" />Opened At</TableHead>
              <TableHead><BadgeCheck className="inline mr-1 h-4 w-4" />Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDeliveries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No notification deliveries found
                </TableCell>
              </TableRow>
            ) : (
              sortedDeliveries.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.id}</TableCell>
                  <TableCell>{d.notification_id}</TableCell>
                  <TableCell>{d.user_id}</TableCell>
                  <TableCell>{d.delivered_at ? new Date(d.delivered_at).toLocaleString() : '-'}</TableCell>
                  <TableCell>{d.opened_at ? new Date(d.opened_at).toLocaleString() : '-'}</TableCell>
                  <TableCell>{d.status}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default NotificationDeliveries; 