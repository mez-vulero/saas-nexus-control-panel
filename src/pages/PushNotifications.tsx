
import { pushNotifications, products } from "@/mock/mockData";
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
import { Textarea } from "@/components/ui/textarea";
import { Bell, Search, Plus } from "lucide-react";
import { useState } from "react";

const formatDate = (dateStr: string) => {
  return dateStr ? new Date(dateStr).toLocaleDateString() : "Not sent";
};

const PushNotifications = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNotifications = pushNotifications.filter(
    (notification) =>
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search push notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <Plus className="mr-2 h-4 w-4" /> Create Push
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create Push Notification</DialogTitle>
              <DialogDescription>
                Send a push notification to your users.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="product" className="text-right">
                  Product
                </Label>
                <select
                  id="product"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <select
                  id="type"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="announcement">Announcement</option>
                  <option value="update">Update</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="security">Security</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input id="title" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="message" className="text-right">
                  Message
                </Label>
                <Textarea 
                  id="message" 
                  className="col-span-3 resize-none" 
                  placeholder="Push notification content..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <select
                  id="status"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Schedule</option>
                  <option value="sent">Send Now</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Push Details</TableHead>
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
                  No push notifications found
                </TableCell>
              </TableRow>
            ) : (
              filteredNotifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <Bell className="h-4 w-4 text-muted-foreground" />
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

export default PushNotifications;
