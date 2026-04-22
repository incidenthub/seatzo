import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  DollarSign,
  Filter,
  LogOut,
  RefreshCcw,
  Search,
  Shield,
  Sparkles,
  TrendingUp,
  UserCog,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { CATEGORY_META } from '../config/constants';
import adminService from '../services/admin.service';
import { logoutStart } from '../store/slices/authSlice';

const DEFAULT_REVENUE = { totalRevenue: 0, totalBookings: 0 };

const ROLE_META = {
  customer: {
    label: 'Customer',
    badgeClassName: 'border-stone-200 bg-stone-100 text-stone-700',
    cardClassName: 'border-stone-200 bg-white',
  },
  organiser: {
    label: 'Organiser',
    badgeClassName: 'border-sky-200 bg-sky-50 text-sky-700',
    cardClassName: 'border-sky-200 bg-sky-50/35',
  },
  admin: {
    label: 'Admin',
    badgeClassName: 'border-[#DC3558]/20 bg-[#DC3558]/10 text-[#DC3558]',
    cardClassName: 'border-[#DC3558]/20 bg-[#DC3558]/5',
  },
};

const ROLE_OPTIONS = [
  { value: 'customer', label: 'Customer' },
  { value: 'organiser', label: 'Organiser' },
  { value: 'admin', label: 'Admin' },
];

const VERIFICATION_OPTIONS = [
  { value: 'all', label: 'All verification states' },
  { value: 'verified', label: 'Verified only' },
  { value: 'unverified', label: 'Unverified only' },
];

const EVENT_STATUS_META = {
  draft: {
    label: 'Draft',
    badgeClassName: 'border-amber-200 bg-amber-50 text-amber-700',
    cardClassName: 'border-amber-200 bg-amber-50/35',
  },
  published: {
    label: 'Published',
    badgeClassName: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    cardClassName: 'border-emerald-200 bg-emerald-50/25',
  },
  cancelled: {
    label: 'Cancelled',
    badgeClassName: 'border-rose-200 bg-rose-50 text-rose-700',
    cardClassName: 'border-rose-200 bg-rose-50/30',
  },
  completed: {
    label: 'Completed',
    badgeClassName: 'border-stone-200 bg-stone-100 text-stone-700',
    cardClassName: 'border-stone-200 bg-white',
  },
};

const EVENT_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
];

const formatNumber = (value = 0) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(value || 0));

const formatCurrency = (value = 0) =>
  `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(value || 0))}`;

const formatDate = (value) => {
  if (!value) {
    return 'TBD';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'TBD';
  }

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateTime = (value) => {
  if (!value) {
    return 'Waiting for first sync';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Waiting for first sync';
  }

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const humanize = (value = '') =>
  value
    .toString()
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(^|\s)\S/g, (character) => character.toUpperCase()) || 'Event';

const getInitial = (value) => value?.trim()?.[0]?.toUpperCase() || '?';

const getTimestamp = (value) => {
  const timestamp = new Date(value || 0).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const getRoleMeta = (role) => ROLE_META[role] || ROLE_META.customer;

const getStatusMeta = (status) => EVENT_STATUS_META[status] || EVENT_STATUS_META.draft;

const getCategoryMeta = (category) => CATEGORY_META[category] || { icon: '•', label: humanize(category) };

const getOccupancy = (event, analytics = null) => {
  const totalSeats = Number(analytics?.totalSeats || event?.totalSeats || 0);

  if (!totalSeats) {
    return 0;
  }

  const availableSeats = Number(analytics?.availableSeats ?? event?.availableSeats ?? totalSeats);
  const soldSeats = Math.max(0, totalSeats - availableSeats);

  return Math.min(100, Math.max(0, Math.round((soldSeats / totalSeats) * 100)));
};

const unwrapAdminList = (response) => (Array.isArray(response?.data?.data) ? response.data.data : []);

const unwrapAdminObject = (response, fallback) =>
  response?.data?.data && typeof response.data.data === 'object' ? response.data.data : fallback;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [revenue, setRevenue] = useState(DEFAULT_REVENUE);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [lastSynced, setLastSynced] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userVerificationFilter, setUserVerificationFilter] = useState('all');
  const [eventSearch, setEventSearch] = useState('');
  const [eventStatusFilter, setEventStatusFilter] = useState('all');
  const [eventCategoryFilter, setEventCategoryFilter] = useState('all');

  const loadDashboard = useCallback(async ({ refreshing = false } = {}) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const [usersResult, eventsResult, revenueResult] = await Promise.allSettled([
        adminService.getAllUsers(),
        adminService.getAllEvents(),
        adminService.getPlatformRevenue(),
      ]);

      const hadSuccess = [usersResult, eventsResult, revenueResult].some((result) => result.status === 'fulfilled');
      const hadFailures = [usersResult, eventsResult, revenueResult].some((result) => result.status === 'rejected');

      if (usersResult.status === 'fulfilled') {
        setUsers(unwrapAdminList(usersResult.value));
      }

      if (eventsResult.status === 'fulfilled') {
        setEvents(unwrapAdminList(eventsResult.value));
      }

      if (revenueResult.status === 'fulfilled') {
        setRevenue(unwrapAdminObject(revenueResult.value, DEFAULT_REVENUE));
      }

      if (hadSuccess) {
        setLastSynced(new Date());
        if (hadFailures) {
          setError('Some admin data could not be refreshed. Showing the latest successful data.');
        }
      } else {
        setError('Unable to load the admin dashboard right now. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      navigate('/login', { replace: true });
      return;
    }

    void loadDashboard();
  }, [loadDashboard, navigate, token, user?.role]);

  const handleLogout = () => {
    dispatch(logoutStart());
    navigate('/login', { replace: true });
  };

  const handleRefresh = () => {
    void loadDashboard({ refreshing: true });
  };

  const handleRoleChange = async (userId, nextRole) => {
    if (String(userId) === String(user?._id)) {
      setError('You cannot change your own admin role from this dashboard.');
      return;
    }

    const currentUser = users.find((entry) => String(entry._id) === String(userId));
    if (currentUser?.role === nextRole) {
      return;
    }

    setUpdatingUserId(userId);

    try {
      const response = await adminService.updateUserRole(userId, nextRole);
      const updatedUser = response?.data?.data || {};

      setUsers((currentUsers) =>
        currentUsers.map((entry) =>
          String(entry._id) === String(userId)
            ? { ...entry, ...updatedUser, role: nextRole }
            : entry,
        ),
      );

      void loadDashboard({ refreshing: true });
    } catch (updateError) {
      setError(updateError?.response?.data?.error?.message || 'Failed to update role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const roleCounts = users.reduce(
    (counts, entry) => {
      const role = entry?.role || 'customer';
      counts[role] = (counts[role] || 0) + 1;
      return counts;
    },
    { customer: 0, organiser: 0, admin: 0 },
  );

  const statusCounts = events.reduce(
    (counts, entry) => {
      const status = entry?.status || 'draft';
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    },
    { draft: 0, published: 0, cancelled: 0, completed: 0 },
  );

  const verifiedUsers = users.filter((entry) => entry?.isVerified).length;
  const totalUsers = users.length;
  const totalEvents = events.length;
  const totalBookings = Number(revenue?.totalBookings || 0);
  const totalRevenueRupees = Number(revenue?.totalRevenue || 0) / 100;
  const averageBookingValue = totalBookings > 0 ? totalRevenueRupees / totalBookings : 0;
  const totalSeats = events.reduce((sum, entry) => sum + Number(entry?.totalSeats || 0), 0);
  const availableSeats = events.reduce((sum, entry) => sum + Number(entry?.availableSeats ?? entry?.totalSeats ?? 0), 0);
  const filledSeats = Math.max(0, totalSeats - availableSeats);
  const occupancyRate = totalSeats > 0 ? (filledSeats / totalSeats) * 100 : 0;
  const managedRoles = roleCounts.admin + roleCounts.organiser;
  const hasData = totalUsers > 0 || totalEvents > 0 || totalRevenueRupees > 0 || totalBookings > 0;

  const overviewCards = [
    {
      label: 'Total users',
      value: formatNumber(totalUsers),
      note: `${formatNumber(verifiedUsers)} verified accounts`,
      icon: Users,
    },
    {
      label: 'Managed roles',
      value: formatNumber(managedRoles),
      note: `${formatNumber(roleCounts.admin)} admins · ${formatNumber(roleCounts.organiser)} organisers`,
      icon: UserCog,
    },
    {
      label: 'Total events',
      value: formatNumber(totalEvents),
      note: `${formatNumber(statusCounts.published)} published right now`,
      icon: Calendar,
    },
    {
      label: 'Draft events',
      value: formatNumber(statusCounts.draft),
      note: 'Awaiting publication or review',
      icon: Shield,
    },
    {
      label: 'Platform revenue',
      value: formatCurrency(totalRevenueRupees),
      note: `${formatCurrency(averageBookingValue)} average booking`,
      icon: DollarSign,
    },
    {
      label: 'Seat occupancy',
      value: `${Math.round(occupancyRate)}%`,
      note: `${formatNumber(filledSeats)} of ${formatNumber(totalSeats)} seats filled`,
      icon: TrendingUp,
    },
  ];

  const tabs = [
    { key: 'users', label: 'Users', icon: Users, count: totalUsers },
    { key: 'events', label: 'Events', icon: Calendar, count: totalEvents },
  ];

  const categoryOptions = [
    'all',
    ...Array.from(new Set([...Object.keys(CATEGORY_META), ...events.map((entry) => entry?.category).filter(Boolean)])),
  ];

  const normalizedUserSearch = userSearch.trim().toLowerCase();
  const normalizedEventSearch = eventSearch.trim().toLowerCase();

  const filteredUsers = [...users]
    .filter((entry) => {
      const haystack = [entry?.name, entry?.email, entry?.phone, entry?.role]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesSearch = !normalizedUserSearch || haystack.includes(normalizedUserSearch);
      const matchesRole = userRoleFilter === 'all' || entry?.role === userRoleFilter;
      const matchesVerification =
        userVerificationFilter === 'all'
          ? true
          : userVerificationFilter === 'verified'
            ? Boolean(entry?.isVerified)
            : !entry?.isVerified;

      return matchesSearch && matchesRole && matchesVerification;
    })
    .sort((left, right) => getTimestamp(right.createdAt || right.updatedAt) - getTimestamp(left.createdAt || left.updatedAt));

  const filteredEvents = [...events]
    .filter((entry) => {
      const haystack = [
        entry?.title,
        entry?.venue,
        entry?.city,
        entry?.category,
        entry?.status,
        entry?.organiser?.name,
        entry?.organiser?.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = !normalizedEventSearch || haystack.includes(normalizedEventSearch);
      const matchesStatus = eventStatusFilter === 'all' || entry?.status === eventStatusFilter;
      const matchesCategory = eventCategoryFilter === 'all' || entry?.category === eventCategoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((left, right) => getTimestamp(right.date) - getTimestamp(left.date));

  const userFiltersActive = normalizedUserSearch || userRoleFilter !== 'all' || userVerificationFilter !== 'all';
  const eventFiltersActive = normalizedEventSearch || eventStatusFilter !== 'all' || eventCategoryFilter !== 'all';

  const clearUserFilters = () => {
    setUserSearch('');
    setUserRoleFilter('all');
    setUserVerificationFilter('all');
  };

  const clearEventFilters = () => {
    setEventSearch('');
    setEventStatusFilter('all');
    setEventCategoryFilter('all');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-stone-900">
        <LoadingSpinner fullPage />
      </div>
    );
  }

  if (error && !hasData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 text-stone-900">
        <div className="max-w-lg rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-200 bg-white text-rose-600">
            <Shield size={22} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500">Admin dashboard</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-stone-950">Platform data is unavailable.</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">{error}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-950 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#DC3558]"
            >
              <RefreshCcw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              Retry refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-stone-900 selection:bg-[#DC3558] selection:text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-72 bg-linear-to-b from-stone-50 to-transparent" />
        <div className="absolute -left-28 top-32 h-72 w-72 rounded-full bg-[#DC3558]/10 blur-3xl" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-stone-900/5 blur-3xl" />
      </div>

      <nav className="fixed top-0 z-50 w-full border-b border-stone-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <span className="text-xl font-black tracking-tighter text-stone-950">
              SEATZO<span className="text-[#DC3558]">.</span>
            </span>
            <div className="hidden h-4 w-px bg-stone-200 md:block" />
            <div className="hidden md:block">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Admin console</p>
              <p className="mt-1 text-xs font-semibold text-stone-500">Live platform data for users, events, and revenue.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden rounded-2xl border border-stone-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 lg:block">
              Synced: {formatDateTime(lastSynced)}
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-stone-700 transition hover:border-stone-950 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Refreshing' : 'Refresh'}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-2xl bg-stone-950 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#DC3558]"
            >
              <LogOut size={14} />
              Exit Admin
            </button>
          </div>
        </div>
      </nav>

      <main className="relative mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <header className="max-w-3xl">
          <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#DC3558]/20 bg-[#DC3558]/10 text-[#DC3558]">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Admin access</p>
                <p className="mt-1 text-sm font-semibold text-stone-500">Signed in as {user?.name || user?.email || 'Admin'}</p>
              </div>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-stone-950 sm:text-5xl lg:text-6xl">
              Platform control center.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-500 sm:text-base">
              Monitor users, manage roles, review every event including drafts, and track platform revenue from the live admin APIs.
            </p>
          </motion.div>

          {error ? (
            <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
              {error}
            </div>
          ) : null}
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {overviewCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.article
                key={card.label}
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-950 text-white">
                    <Icon size={18} />
                  </div>
                  <ArrowRight size={18} className="text-stone-300" />
                </div>
                <p className="mt-8 text-[10px] font-black uppercase tracking-[0.32em] text-stone-400">{card.label}</p>
                <h2 className="mt-3 text-4xl font-black tracking-tight text-stone-950">{card.value}</h2>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">{card.note}</p>
              </motion.article>
            );
          })}
        </section>

        <section className="mt-12 flex flex-wrap gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-[10px] font-black uppercase tracking-[0.25em] transition ${
                  activeTab === tab.key
                    ? 'border-stone-950 bg-stone-950 text-white'
                    : 'border-stone-200 bg-white text-stone-500 hover:border-stone-950 hover:text-stone-950'
                }`}
              >
                <Icon size={14} />
                {tab.label}
                <span className={`rounded-full px-2 py-0.5 ${activeTab === tab.key ? 'bg-white/10 text-white' : 'bg-stone-100 text-stone-500'}`}>
                  {formatNumber(tab.count)}
                </span>
              </button>
            );
          })}
        </section>

        {activeTab === 'users' ? (
          <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">User management</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">Update roles without leaving the dashboard.</h2>
                <p className="mt-2 text-sm text-stone-500">
                  {formatNumber(filteredUsers.length)} of {formatNumber(users.length)} users match the current filters.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Verified', value: verifiedUsers, className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
                  { label: 'Customers', value: roleCounts.customer, className: 'border-stone-200 bg-stone-100 text-stone-700' },
                  { label: 'Organisers', value: roleCounts.organiser, className: 'border-sky-200 bg-sky-50 text-sky-700' },
                  { label: 'Admins', value: roleCounts.admin, className: 'border-[#DC3558]/20 bg-[#DC3558]/10 text-[#DC3558]' },
                ].map((chip) => (
                  <span
                    key={chip.label}
                    className={`rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.28em] ${chip.className}`}
                  >
                    {chip.label} {formatNumber(chip.value)}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-4">
              <div className="relative lg:col-span-2">
                <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="search"
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                  placeholder="Search name, email, phone, or role"
                  aria-label="Search users"
                  className="w-full rounded-2xl border border-stone-200 bg-white py-3 pl-12 pr-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#DC3558] focus:ring-2 focus:ring-[#DC3558]/10"
                />
              </div>

              <div className="relative">
                <select
                  value={userRoleFilter}
                  onChange={(event) => setUserRoleFilter(event.target.value)}
                  aria-label="Filter users by role"
                  className="w-full appearance-none rounded-2xl border border-stone-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-stone-700 outline-none transition focus:border-[#DC3558] focus:ring-2 focus:ring-[#DC3558]/10"
                >
                  <option value="all">All roles</option>
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-400" />
              </div>

              <div className="relative">
                <select
                  value={userVerificationFilter}
                  onChange={(event) => setUserVerificationFilter(event.target.value)}
                  aria-label="Filter users by verification state"
                  className="w-full appearance-none rounded-2xl border border-stone-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-stone-700 outline-none transition focus:border-[#DC3558] focus:ring-2 focus:ring-[#DC3558]/10"
                >
                  {VERIFICATION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-400" />
              </div>

              {userFiltersActive ? (
                <button
                  type="button"
                  onClick={clearUserFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-950 bg-stone-950 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#DC3558]"
                >
                  <Filter size={14} />
                  Reset filters
                </button>
              ) : (
                <div className="flex items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">
                  Live user data
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { label: 'Verified', value: verifiedUsers, className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
                { label: 'Unverified', value: totalUsers - verifiedUsers, className: 'border-amber-200 bg-amber-50 text-amber-700' },
                { label: 'Customers', value: roleCounts.customer, className: 'border-stone-200 bg-stone-100 text-stone-700' },
                { label: 'Organisers', value: roleCounts.organiser, className: 'border-sky-200 bg-sky-50 text-sky-700' },
                { label: 'Admins', value: roleCounts.admin, className: 'border-[#DC3558]/20 bg-[#DC3558]/10 text-[#DC3558]' },
              ].map((chip) => (
                <span
                  key={chip.label}
                  className={`rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.28em] ${chip.className}`}
                >
                  {chip.label} {formatNumber(chip.value)}
                </span>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              {filteredUsers.length ? (
                filteredUsers.map((entry, index) => {
                  const roleMeta = getRoleMeta(entry?.role);
                  const isCurrentAdmin = String(entry?._id) === String(user?._id);
                  const isLocked = updatingUserId === entry?._id || isCurrentAdmin;

                  return (
                    <motion.article
                      key={entry?._id || `${entry?.email}-${index}`}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.03 }}
                      className={`rounded-3xl border p-5 shadow-sm transition ${isCurrentAdmin ? 'border-[#DC3558]/20 bg-[#DC3558]/5' : roleMeta.cardClassName}`}
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex flex-1 items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-stone-950 text-sm font-black text-white">
                            {getInitial(entry?.name)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-black tracking-tight text-stone-950">{entry?.name || 'Unnamed user'}</h3>
                              {isCurrentAdmin ? (
                                <span className="rounded-full border border-[#DC3558]/20 bg-[#DC3558]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.25em] text-[#DC3558]">
                                  Current admin
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 text-sm text-stone-500">{entry?.email || 'No email on file'}</p>
                            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">
                              {entry?.phone ? `Phone ${entry.phone}` : 'Phone not provided'} · Joined {formatDate(entry?.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.28em] ${
                              entry?.isVerified
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-amber-200 bg-amber-50 text-amber-700'
                            }`}
                          >
                            {entry?.isVerified ? 'Verified' : 'Unverified'}
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.28em] ${roleMeta.badgeClassName}`}
                          >
                            {roleMeta.label}
                          </span>
                        </div>

                        <div className="relative min-w-50">
                          <select
                            value={entry?.role || 'customer'}
                            onChange={(event) => handleRoleChange(entry?._id, event.target.value)}
                            disabled={isLocked}
                            aria-label={`Change role for ${entry?.name || entry?.email || 'user'}`}
                            className={`w-full appearance-none rounded-2xl border px-4 py-3 pr-10 text-xs font-black uppercase tracking-[0.22em] outline-none transition ${
                              roleMeta.badgeClassName
                            } ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} focus:ring-2 focus:ring-[#DC3558]/10`}
                          >
                            {ROLE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-500" />
                          {isCurrentAdmin ? (
                            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                              Your own role is locked from this screen.
                            </p>
                          ) : updatingUserId === entry?._id ? (
                            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                              Updating role...
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </motion.article>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-stone-200 bg-stone-50 px-6 py-12 text-center">
                  <p className="text-lg font-black tracking-tight text-stone-950">No users match these filters.</p>
                  <p className="mt-2 text-sm text-stone-500">Try widening the search or resetting the filters to bring the list back.</p>
                  {userFiltersActive ? (
                    <button
                      type="button"
                      onClick={clearUserFilters}
                      className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-stone-950 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#DC3558]"
                    >
                      <Filter size={14} />
                      Reset filters
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Event moderation</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">View every event, including drafts.</h2>
                <p className="mt-2 text-sm text-stone-500">
                  {formatNumber(filteredEvents.length)} of {formatNumber(events.length)} events match the current filters.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Published', value: statusCounts.published, className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
                  { label: 'Draft', value: statusCounts.draft, className: 'border-amber-200 bg-amber-50 text-amber-700' },
                  { label: 'Cancelled', value: statusCounts.cancelled, className: 'border-rose-200 bg-rose-50 text-rose-700' },
                  { label: 'Completed', value: statusCounts.completed, className: 'border-stone-200 bg-stone-100 text-stone-700' },
                ].map((chip) => (
                  <span
                    key={chip.label}
                    className={`rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.28em] ${chip.className}`}
                  >
                    {chip.label} {formatNumber(chip.value)}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-4">
              <div className="relative lg:col-span-2">
                <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="search"
                  value={eventSearch}
                  onChange={(event) => setEventSearch(event.target.value)}
                  placeholder="Search title, venue, city, organiser, or category"
                  aria-label="Search events"
                  className="w-full rounded-2xl border border-stone-200 bg-white py-3 pl-12 pr-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#DC3558] focus:ring-2 focus:ring-[#DC3558]/10"
                />
              </div>

              <div className="relative">
                <select
                  value={eventStatusFilter}
                  onChange={(event) => setEventStatusFilter(event.target.value)}
                  aria-label="Filter events by status"
                  className="w-full appearance-none rounded-2xl border border-stone-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-stone-700 outline-none transition focus:border-[#DC3558] focus:ring-2 focus:ring-[#DC3558]/10"
                >
                  {EVENT_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-400" />
              </div>

              <div className="relative">
                <select
                  value={eventCategoryFilter}
                  onChange={(event) => setEventCategoryFilter(event.target.value)}
                  aria-label="Filter events by category"
                  className="w-full appearance-none rounded-2xl border border-stone-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-stone-700 outline-none transition focus:border-[#DC3558] focus:ring-2 focus:ring-[#DC3558]/10"
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All categories' : getCategoryMeta(category).label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-400" />
              </div>

              {eventFiltersActive ? (
                <button
                  type="button"
                  onClick={clearEventFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-950 bg-stone-950 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#DC3558]"
                >
                  <Filter size={14} />
                  Reset filters
                </button>
              ) : (
                <div className="flex items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-stone-400">
                  Live event data
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { label: 'Published', value: statusCounts.published, className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
                { label: 'Draft', value: statusCounts.draft, className: 'border-amber-200 bg-amber-50 text-amber-700' },
                { label: 'Cancelled', value: statusCounts.cancelled, className: 'border-rose-200 bg-rose-50 text-rose-700' },
                { label: 'Completed', value: statusCounts.completed, className: 'border-stone-200 bg-stone-100 text-stone-700' },
                { label: 'Occupancy', value: `${Math.round(occupancyRate)}%`, className: 'border-[#DC3558]/20 bg-[#DC3558]/10 text-[#DC3558]' },
              ].map((chip) => (
                <span
                  key={chip.label}
                  className={`rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.28em] ${chip.className}`}
                >
                  {chip.label} {chip.value}
                </span>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              {filteredEvents.length ? (
                filteredEvents.map((entry, index) => {
                  const statusMeta = getStatusMeta(entry?.status);
                  const categoryMeta = getCategoryMeta(entry?.category);
                  const occupancy = getOccupancy(entry);
                  const occupancyTone =
                    occupancy < 40 ? 'bg-emerald-500' : occupancy < 75 ? 'bg-amber-500' : 'bg-rose-500';

                  return (
                    <motion.article
                      key={entry?._id || `${entry?.title}-${index}`}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.03 }}
                      className={`rounded-3xl border p-5 shadow-sm transition ${statusMeta.cardClassName}`}
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="flex flex-1 gap-4">
                          <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-3xl border border-stone-200 bg-stone-100">
                            {entry?.posterUrl ? (
                              <img
                                src={entry.posterUrl}
                                alt={entry?.title || 'Event poster'}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center bg-linear-to-br from-stone-900 to-stone-700 text-white">
                                <span className="text-2xl">{categoryMeta.icon}</span>
                                <span className="mt-2 text-[9px] font-black uppercase tracking-[0.25em] text-white/75">Poster</span>
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.28em] ${statusMeta.badgeClassName}`}
                              >
                                {statusMeta.label}
                              </span>
                              <span className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.28em] text-stone-500">
                                {categoryMeta.icon} {categoryMeta.label}
                              </span>
                            </div>

                            <h3 className="mt-3 text-2xl font-black tracking-tight text-stone-950">{entry?.title || 'Untitled event'}</h3>
                            <p className="mt-2 text-sm text-stone-500">
                              {entry?.venue || 'Venue TBA'} · {entry?.city || 'City TBA'} · {formatDate(entry?.date)}
                            </p>

                            <div className="mt-4 grid gap-2 sm:grid-cols-3">
                              <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                                <p className="text-[9px] font-black uppercase tracking-[0.28em] text-stone-400">Organiser</p>
                                <p className="mt-1 text-sm font-bold text-stone-950">{entry?.organiser?.name || 'Unknown'}</p>
                                <p className="text-xs text-stone-500">{entry?.organiser?.email || 'No email available'}</p>
                              </div>
                              <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                                <p className="text-[9px] font-black uppercase tracking-[0.28em] text-stone-400">Seats</p>
                                <p className="mt-1 text-sm font-bold text-stone-950">
                                  {formatNumber(entry?.availableSeats || 0)} / {formatNumber(entry?.totalSeats || 0)}
                                </p>
                                <p className="text-xs text-stone-500">Available vs total</p>
                              </div>
                              <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                                <p className="text-[9px] font-black uppercase tracking-[0.28em] text-stone-400">Snapshot</p>
                                <p className="mt-1 text-sm font-bold text-stone-950">{Math.round(occupancy)}% occupancy</p>
                                <p className="text-xs text-stone-500">{formatNumber(filledSeats)} seats booked platform-wide</p>
                              </div>
                            </div>

                            <div className="mt-4">
                              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.28em] text-stone-400">
                                <span>Occupancy</span>
                                <span>{Math.round(occupancy)}%</span>
                              </div>
                              <div className="mt-2 h-2 rounded-full bg-stone-100">
                                <div
                                  className={`h-2 rounded-full ${occupancyTone}`}
                                  style={{ width: `${occupancy}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-start gap-3 xl:items-end">
                          <div className="text-left xl:text-right">
                            <p className="text-2xl font-black tracking-tight text-stone-950">{formatNumber(entry?.availableSeats || 0)}</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-stone-400">Available seats</p>
                          </div>
                          <div className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.28em] text-stone-500">
                            Updated {formatDate(entry?.updatedAt || entry?.createdAt || entry?.date)}
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-stone-200 bg-stone-50 px-6 py-12 text-center">
                  <p className="text-lg font-black tracking-tight text-stone-950">No events match these filters.</p>
                  <p className="mt-2 text-sm text-stone-500">Try widening the search or resetting the filters to inspect the full event catalog.</p>
                  {eventFiltersActive ? (
                    <button
                      type="button"
                      onClick={clearEventFilters}
                      className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-stone-950 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#DC3558]"
                    >
                      <Filter size={14} />
                      Reset filters
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;