import { smsNotifications, products } from "@/mock/mockData";
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
import { Textarea } from "@/components/ui/textarea";
import { Mail, Search, Plus, Filter, CheckCheck, X } from "lucide-react";
import { useState } from "react";

const formatDate = (dateStr: string) => {
  return dateStr ? new Date(dateStr).toLocaleDateString() : "Not sent";
};

const SMSNotifications = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    product: "",
    type: "",
    status: "",
  });
  
  // Get unique values for filters
  const productNames = Array.from(new Set(smsNotifications.map(n => n.productName)));
  const types = Array.from(new Set(smsNotifications.map(n => n.type)));
  const statuses = Array.from(new Set(smsNotifications.map(n => n.status)));

  const filteredNotifications = smsNotifications.filter(
    (notification) => {
      // Search filter
      const matchesSearch =
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.productName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Product filter
      const matchesProduct = filters.product === "all" || !filters.product || notification.productName === filters.product;
      
      // Type filter
      const matchesType = filters.type === "all" || !filters.type || notification.type === filters.type;
      
      // Status filter
      const matchesStatus = filters.status === "all" || !filters.status || notification.status === filters.status;

      return matchesSearch && matchesProduct && matchesType && matchesStatus;
    }
  );

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      product: "",
      type: "",
      status: "",
    });
  };

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-500";
      case "scheduled":
        return "bg-blue-500";
      case "draft":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "announcement":
        return "bg-blue-500";
      case "update":
        return "bg-green-500";
      case "maintenance":
        return "bg-yellow-500";
      case "security":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search SMS notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        {/* Filter Bar (replaces DropdownMenu) */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative w-40">
            <Label htmlFor="filter-product" className="text-xs absolute left-2 top-1">Product</Label>
            <Select
              value={filters.product}
              onValueChange={(value) => setFilters({ ...filters, product: value })}
            >
              <SelectTrigger id="filter-product" className="mt-5">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All products</SelectItem>
                {productNames.map((product) => (
                  <SelectItem key={product} value={product}>
                    {product}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative w-40">
            <Label htmlFor="filter-type" className="text-xs absolute left-2 top-1">Type</Label>
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters({ ...filters, type: value })}
            >
              <SelectTrigger id="filter-type" className="mt-5">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative w-40">
            <Label htmlFor="filter-status" className="text-xs absolute left-2 top-1">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger id="filter-status" className="mt-5">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            onClick={resetFilters}
            className="h-10 mt-5"
            disabled={!activeFilterCount}
          >
            <X className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>
        {/* Filter chips/tags display */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
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
            {filters.type && (
              <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
                <CheckCheck className="h-3 w-3" />
                Type: {filters.type}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => setFilters({ ...filters, type: "" })}
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SMS Details</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent At</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredNotifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  No SMS notifications found
                </TableCell>
              </TableRow>
            ) : (
              filteredNotifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {notification.message.length > 50
                            ? notification.message.substring(0, 50) + "..."
                            : notification.message}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(notification.type)}>
                      {notification.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{notification.productName}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(notification.status)}>
                      {notification.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(notification.sentAt)}</TableCell>
                  <TableCell>
                    {notification.status === "sent" ? (
                      <div className="text-xs">
                        <span className="font-medium">
                          {notification.deliveredTo} / {notification.sentTo}
                        </span>{" "}
                        delivered (
                        {Math.round(
                          (notification.deliveredTo / notification.sentTo) * 100
                        )}
                        %)
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">
                      {notification.status === "draft" ? "Edit" : "View"}
                    </Button>
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

export default SMSNotifications;
