
export type User = {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  createdAt: string;
  lastLogin: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  status: "active" | "draft" | "archived";
  userCount: number;
  revenueGenerated: number;
};

export type Subscription = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  productId: string;
  productName: string;
  plan: "free" | "starter" | "professional" | "enterprise";
  status: "active" | "cancelled" | "trial" | "past_due";
  startDate: string;
  endDate: string;
  amount: number;
  interval: "monthly" | "annual";
};

export type Notification = {
  id: string;
  productId: string;
  productName: string;
  type: "announcement" | "update" | "maintenance" | "security";
  title: string;
  message: string;
  sentAt: string;
  status: "draft" | "scheduled" | "sent" | "failed";
  sentTo: number;
  deliveredTo: number;
};

// Generate mock users
export const users: User[] = Array.from({ length: 20 }, (_, i) => {
  const id = `u-${i.toString().padStart(3, "0")}`;
  const statuses = ["active", "inactive"] as const;
  const randomDate = (start: Date, end: Date) => {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    ).toISOString();
  };

  return {
    id,
    name: `User ${id}`,
    email: `user${i}@example.com`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    createdAt: randomDate(new Date(2022, 0, 1), new Date()),
    lastLogin: randomDate(new Date(2023, 0, 1), new Date()),
  };
});

// Generate mock products
export const products: Product[] = [
  {
    id: "p-001",
    name: "Analytics Dashboard",
    description: "Real-time analytics dashboard for business metrics",
    status: "active",
    userCount: 256,
    revenueGenerated: 25600,
  },
  {
    id: "p-002",
    name: "CRM Suite",
    description: "Customer relationship management platform",
    status: "active",
    userCount: 189,
    revenueGenerated: 18900,
  },
  {
    id: "p-003",
    name: "Project Manager",
    description: "Project management and collaboration tool",
    status: "active",
    userCount: 342,
    revenueGenerated: 34200,
  },
  {
    id: "p-004",
    name: "Email Marketing",
    description: "Email campaign manager and analytics",
    status: "draft",
    userCount: 0,
    revenueGenerated: 0,
  },
  {
    id: "p-005",
    name: "Accounting Software",
    description: "Cloud-based accounting and bookkeeping",
    status: "archived",
    userCount: 58,
    revenueGenerated: 5800,
  },
];

// Generate mock subscriptions
export const subscriptions: Subscription[] = [];

const plans = ["free", "starter", "professional", "enterprise"] as const;
const statuses = ["active", "cancelled", "trial", "past_due"] as const;
const intervals = ["monthly", "annual"] as const;

users.forEach((user) => {
  const numSubs = Math.floor(Math.random() * 3) + 1; // 1-3 subscriptions per user
  
  for (let i = 0; i < numSubs; i++) {
    if (i < products.filter(p => p.status === "active").length) {
      const product = products[i % products.length];
      if (product.status !== "active") continue;
      
      const plan = plans[Math.floor(Math.random() * plans.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const interval = intervals[Math.floor(Math.random() * intervals.length)];
      
      const today = new Date();
      const startDate = new Date(today);
      startDate.setMonth(today.getMonth() - Math.floor(Math.random() * 12));
      
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + (interval === "annual" ? 12 : 1));
      
      let amount = 0;
      if (plan === "starter") amount = 9.99;
      if (plan === "professional") amount = 29.99;
      if (plan === "enterprise") amount = 99.99;
      if (interval === "annual") amount *= 10; // 2 months free for annual
      
      subscriptions.push({
        id: `s-${subscriptions.length.toString().padStart(3, "0")}`,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        productId: product.id,
        productName: product.name,
        plan,
        status,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        amount,
        interval
      });
    }
  }
});

// Generate mock SMS notifications
export const smsNotifications: Notification[] = [
  {
    id: "n-001",
    productId: "p-001",
    productName: "Analytics Dashboard",
    type: "update",
    title: "New Analytics Features",
    message: "We've added new visualization tools to your dashboard",
    sentAt: new Date(2023, 8, 15).toISOString(),
    status: "sent",
    sentTo: 256,
    deliveredTo: 242
  },
  {
    id: "n-002",
    productId: "p-002",
    productName: "CRM Suite",
    type: "maintenance",
    title: "Scheduled Maintenance",
    message: "The system will be down for maintenance on Sunday from 2-4 AM",
    sentAt: new Date(2023, 9, 1).toISOString(),
    status: "sent",
    sentTo: 189,
    deliveredTo: 185
  },
  {
    id: "n-003",
    productId: "p-003",
    productName: "Project Manager",
    type: "announcement",
    title: "New Mobile App Release",
    message: "Our mobile app is now available on iOS and Android",
    sentAt: "",
    status: "draft",
    sentTo: 0,
    deliveredTo: 0
  },
];

// Generate mock push notifications
export const pushNotifications: Notification[] = [
  {
    id: "p-001",
    productId: "p-001",
    productName: "Analytics Dashboard",
    type: "security",
    title: "Security Update Required",
    message: "Please update your app to the latest version for important security fixes",
    sentAt: new Date(2023, 10, 5).toISOString(),
    status: "sent",
    sentTo: 256,
    deliveredTo: 220
  },
  {
    id: "p-002",
    productId: "p-002",
    productName: "CRM Suite",
    type: "announcement",
    title: "New Integration Available",
    message: "Connect your CRM with Salesforce now",
    sentAt: "",
    status: "scheduled",
    sentTo: 0,
    deliveredTo: 0
  },
  {
    id: "p-003",
    productId: "p-003",
    productName: "Project Manager",
    type: "update",
    title: "Feature Update",
    message: "Check out our new Kanban board feature",
    sentAt: new Date(2023, 7, 22).toISOString(),
    status: "sent",
    sentTo: 342,
    deliveredTo: 298
  },
];

// Dashboard stats
export const dashboardStats = {
  totalUsers: users.length,
  activeUsers: users.filter(u => u.status === "active").length,
  totalProducts: products.length,
  activeProducts: products.filter(p => p.status === "active").length,
  totalSubscriptions: subscriptions.length,
  activeSubscriptions: subscriptions.filter(s => s.status === "active").length,
  revenueThisMonth: subscriptions
    .filter(s => s.status === "active")
    .reduce((sum, sub) => sum + (sub.interval === "monthly" ? sub.amount : sub.amount / 12), 0),
  totalRevenue: subscriptions
    .reduce((sum, sub) => sum + sub.amount, 0),
  userGrowth: [
    { month: "Jan", users: 120 },
    { month: "Feb", users: 132 },
    { month: "Mar", users: 145 },
    { month: "Apr", users: 162 },
    { month: "May", users: 185 },
    { month: "Jun", users: 204 },
    { month: "Jul", users: 215 },
    { month: "Aug", users: 230 },
    { month: "Sep", users: 245 },
    { month: "Oct", users: 262 },
    { month: "Nov", users: 280 },
    { month: "Dec", users: 290 },
  ],
  revenueByProduct: products.map(p => ({
    name: p.name,
    revenue: p.revenueGenerated
  })),
};
