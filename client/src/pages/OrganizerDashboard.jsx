import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Clock3,
  DollarSign,
  Edit,
  Eye,
  Filter,
  Layers3,
  LogOut,
  MapPin,
  Plus,
  RefreshCcw,
  Search,
  Send,
  Sparkles,
  Ticket,
  Trash2,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { CATEGORY_META, SECTION_COLORS } from '../config/constants';
import adminService from '../services/admin.service';
import eventService from '../services/event.service';
import { logoutStart } from '../store/slices/authSlice';

const EVENT_STATUS = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
});

const STATUS_META = {
  [EVENT_STATUS.DRAFT]: {
    label: 'Draft',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  [EVENT_STATUS.PUBLISHED]: {
    label: 'Published',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  [EVENT_STATUS.CANCELLED]: {
    label: 'Cancelled',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
  },
  [EVENT_STATUS.COMPLETED]: {
    label: 'Completed',
    className: 'border-slate-200 bg-slate-100 text-slate-700',
  },
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: EVENT_STATUS.DRAFT, label: 'Draft' },
  { value: EVENT_STATUS.PUBLISHED, label: 'Published' },
  { value: EVENT_STATUS.CANCELLED, label: 'Cancelled' },
  { value: EVENT_STATUS.COMPLETED, label: 'Completed' },
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All categories' },
  { value: 'concert', label: 'Concert' },
  { value: 'movie', label: 'Movie' },
  { value: 'sports', label: 'Sports' },
  { value: 'theatre', label: 'Theatre' },
  { value: 'standup', label: 'Stand-Up' },
];

const SORT_OPTIONS = [
  { value: 'updated-desc', label: 'Recently updated' },
  { value: 'date-desc', label: 'Newest event date' },
  { value: 'date-asc', label: 'Oldest event date' },
  { value: 'revenue-desc', label: 'Highest revenue' },
  { value: 'bookings-desc', label: 'Most bookings' },
  { value: 'occupancy-desc', label: 'Highest occupancy' },
  { value: 'status', label: 'Status order' },
];

const DEFAULT_PRICING_RULES = {
  maxViewers: 100,
  enableSurge: true,
  maxMultiplier: 3,
};

const DEFAULT_SECTIONS = [
  { name: 'PREMIUM', rows: 'A, B', seatsPerRow: '20', price: '5000' },
  { name: 'GOLD', rows: 'C, D, E', seatsPerRow: '30', price: '3000' },
  { name: 'SILVER', rows: 'F, G', seatsPerRow: '40', price: '2000' },
  { name: 'GENERAL', rows: 'H, I, J', seatsPerRow: '50', price: '1000' },
];

const createDefaultSections = () => DEFAULT_SECTIONS.map((section) => ({ ...section }));

const createEmptyForm = () => ({
  title: '',
  description: '',
  venue: '',
  city: '',
  category: 'concert',
  date: '',
  basePrice: '',
  posterUrl: '',
  tags: '',
  pricingRules: JSON.stringify(DEFAULT_PRICING_RULES, null, 2),
  sections: createDefaultSections(),
});

const createBlankSection = () => ({
  name: '',
  rows: '',
  seatsPerRow: '',
  price: '',
});

const getUserId = (user) => String(user?.id || user?._id || '');

const getEventOwnerId = (event) => String(event?.organiser?._id || event?.organiser?.id || event?.organiser || '');

const parseCsv = (value = '') =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const safeJsonParse = (value, fallback = null) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const formatPaise = (value = 0) => `₹${(Number(value || 0) / 100).toLocaleString('en-IN')}`;

const formatDateTime = (value) => {
  if (!value) {
    return 'TBD';
  }

  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateInput = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const pad = (input) => String(input).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatDateLabel = (value) => {
  if (!value) {
    return 'TBD';
  }

  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const extractEventList = (response) => {
  const payload = response?.data || {};

  if (Array.isArray(payload.events)) {
    return payload.events;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (Array.isArray(payload.results)) {
    return payload.results;
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return [];
};

const extractSingleEvent = (response) => {
  const payload = response?.data || {};

  if (payload.event) {
    return payload.event;
  }

  if (payload.data?.event) {
    return payload.data.event;
  }

  if (payload.data && !Array.isArray(payload.data)) {
    return payload.data;
  }

  return payload;
};

const buildCacheKey = (user) => {
  const userId = getUserId(user);
  return userId ? `seatzo:organizer-dashboard:${userId}` : null;
};

const readCachedEvents = (cacheKey) => {
  if (!cacheKey || typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(cacheKey);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeCachedEvents = (cacheKey, events) => {
  if (!cacheKey || typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(cacheKey, JSON.stringify(events));
};

const normalizeCachedEvent = (event, fallback = {}) => ({
  ...event,
  dashboardSections: Array.isArray(event?.dashboardSections)
    ? event.dashboardSections
    : fallback.dashboardSections || [],
  organiser: event?.organiser || fallback.organiser || null,
});

const mergeEventLists = (serverEvents, cachedEvents, user, isAdmin) => {
  const userId = getUserId(user);
  const managedServerEvents = isAdmin
    ? serverEvents
    : serverEvents.filter((event) => getEventOwnerId(event) === userId);

  const merged = new Map();

  cachedEvents.forEach((event) => {
    if (!event?._id) {
      return;
    }

    merged.set(String(event._id), normalizeCachedEvent(event, { dashboardSections: [] }));
  });

  managedServerEvents.forEach((event) => {
    if (!event?._id) {
      return;
    }

    const key = String(event._id);
    const existing = merged.get(key) || {};

    merged.set(
      key,
      normalizeCachedEvent(
        {
          ...existing,
          ...event,
          organiser: event.organiser || existing.organiser || null,
        },
        {
          dashboardSections: existing.dashboardSections || [],
          organiser: existing.organiser || null,
        },
      ),
    );
  });

  return Array.from(merged.values());
};

const sortDashboardEvents = (events, sortBy, analyticsById) => {
  const list = [...events];

  const getRevenue = (event) => Number(analyticsById?.[event._id]?.totalRevenue || 0);
  const getBookings = (event) => Number(analyticsById?.[event._id]?.totalBookings || 0);
  const getOccupancy = (event) => {
    const stats = analyticsById?.[event._id] || {};
    const totalSeats = Number(stats.totalSeats || event.totalSeats || 0);
    const availableSeats = Number(stats.availableSeats ?? event.availableSeats ?? totalSeats);

    if (!totalSeats) {
      return 0;
    }

    return ((totalSeats - availableSeats) / totalSeats) * 100;
  };

  const getUpdatedAt = (event) => new Date(event.updatedAt || event.createdAt || event.date || 0).getTime();
  const getEventDate = (event) => new Date(event.date || 0).getTime();

  const statusRank = {
    [EVENT_STATUS.DRAFT]: 0,
    [EVENT_STATUS.PUBLISHED]: 1,
    [EVENT_STATUS.CANCELLED]: 2,
    [EVENT_STATUS.COMPLETED]: 3,
  };

  return list.sort((left, right) => {
    switch (sortBy) {
      case 'date-asc':
        return getEventDate(left) - getEventDate(right);
      case 'date-desc':
        return getEventDate(right) - getEventDate(left);
      case 'revenue-desc':
        return getRevenue(right) - getRevenue(left);
      case 'bookings-desc':
        return getBookings(right) - getBookings(left);
      case 'occupancy-desc':
        return getOccupancy(right) - getOccupancy(left);
      case 'status':
        return (statusRank[left.status] ?? 99) - (statusRank[right.status] ?? 99) || getUpdatedAt(right) - getUpdatedAt(left);
      case 'updated-desc':
      default:
        return getUpdatedAt(right) - getUpdatedAt(left);
    }
  });
};

const buildEventForm = (event) => ({
  title: event?.title || '',
  description: event?.description || '',
  venue: event?.venue || '',
  city: event?.city || '',
  category: event?.category || 'concert',
  date: formatDateInput(event?.date),
  basePrice: event?.basePrice != null ? String(event.basePrice) : '',
  posterUrl: event?.posterUrl || '',
  tags: Array.isArray(event?.tags) ? event.tags.join(', ') : '',
  pricingRules: event?.pricingRules
    ? JSON.stringify(event.pricingRules, null, 2)
    : JSON.stringify(DEFAULT_PRICING_RULES, null, 2),
  sections: Array.isArray(event?.dashboardSections) && event.dashboardSections.length > 0
    ? event.dashboardSections.map((section) => ({
      name: section.name || '',
      rows: Array.isArray(section.rows) ? section.rows.join(', ') : String(section.rows || ''),
      seatsPerRow: String(section.seatsPerRow ?? ''),
      price: String(section.price ?? ''),
    }))
    : createDefaultSections(),
});

const buildSectionsPayload = (sections) => sections.map((section) => ({
  name: section.name.trim().toUpperCase(),
  rows: parseCsv(section.rows),
  seatsPerRow: Number(section.seatsPerRow),
  price: Number(section.price),
}));

const buildSectionSummary = (sections) =>
  sections
    .map((section) => {
      const sectionName = section.name?.trim() || 'UNNAMED';
      const rows = Array.isArray(section.rows) ? section.rows : parseCsv(section.rows);
      const seatsPerRow = Number(section.seatsPerRow || 0);
      const price = Number(section.price || 0);

      return {
        name: sectionName,
        rows,
        seatsPerRow,
        price,
      };
    })
    .filter((section) => section.name);

const getStatusMeta = (status) => STATUS_META[status] || STATUS_META[EVENT_STATUS.DRAFT];

const getCategoryLabel = (category) => CATEGORY_META[category]?.label || category || 'Event';

const getCategoryIcon = (category) => CATEGORY_META[category]?.icon || '•';

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  const isOrganiser = user?.role === 'organiser';
  const authRedirect = isAdmin ? '/login' : '/organizer-login';
  const cacheKey = buildCacheKey(user);

  const [events, setEvents] = useState([]);
  const [analyticsById, setAnalyticsById] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastSynced, setLastSynced] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated-desc');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailEvent, setDetailEvent] = useState(null);
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventForm, setEventForm] = useState(createEmptyForm());

  const handleLogout = () => {
    dispatch(logoutStart());
    navigate(authRedirect);
  };

  const persistEvents = (nextEvents) => {
    if (!cacheKey) {
      return;
    }

    writeCachedEvents(cacheKey, nextEvents);
  };

  const upsertEventInState = (nextEvent) => {
    if (!cacheKey) {
      setEvents((current) => {
        const updated = current.filter((event) => String(event._id) !== String(nextEvent._id));
        updated.unshift(nextEvent);
        return updated;
      });
      return;
    }

    const updated = readCachedEvents(cacheKey).filter((event) => String(event._id) !== String(nextEvent._id));
    updated.unshift(nextEvent);
    writeCachedEvents(cacheKey, updated);
    setEvents(updated);
  };

  const refreshDashboard = useCallback(async (silent = false) => {
    if (!token || !user || (!isOrganiser && !isAdmin)) {
      return;
    }

    const cachedEvents = readCachedEvents(cacheKey);
    const shouldShowCache = cachedEvents.length > 0;

    setError(null);

    if (shouldShowCache) {
      setEvents(cachedEvents);
    }

    if (silent || shouldShowCache) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    let serverEvents = [];

    try {
      if (isAdmin) {
        const response = await adminService.getAllEvents();
        serverEvents = extractEventList(response);
      } else {
        const pageSize = 50;
        let page = 1;
        let totalPages = 1;
        const collectedEvents = [];

        do {
          const response = await eventService.getAllEvents({ page, limit: pageSize, sort: 'date' });
          const pageEvents = extractEventList(response);
          collectedEvents.push(...pageEvents);

          const pagination = response?.data?.pagination || {};
          totalPages = Number(pagination.pages || pagination.totalPages || 1);
          page += 1;
        } while (page <= totalPages);

        serverEvents = collectedEvents;
      }
    } catch (requestError) {
      serverEvents = [];
      setError(requestError.response?.data?.error?.message || requestError.response?.data?.message || 'Failed to load dashboard data');
    }

    const mergedEvents = mergeEventLists(serverEvents, cachedEvents, user, isAdmin);
    setEvents(mergedEvents);
    persistEvents(mergedEvents);

    const analyticsMap = {};

    await Promise.all(
      mergedEvents.map(async (event) => {
        try {
          const response = await eventService.getAnalytics(event._id);
          analyticsMap[event._id] = response.data;
        } catch {
          // Keep the rest of the dashboard usable even if one analytics call fails.
        }
      }),
    );

    setAnalyticsById(analyticsMap);
    setLastSynced(new Date());
    setIsLoading(false);
    setIsRefreshing(false);
  }, [cacheKey, isAdmin, isOrganiser, token, user]);

  useEffect(() => {
    if (!token || !user || (!isOrganiser && !isAdmin)) {
      navigate(authRedirect);
      return;
    }

    refreshDashboard();

    const intervalId = window.setInterval(() => {
      refreshDashboard(true);
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [authRedirect, isAdmin, isOrganiser, navigate, refreshDashboard, token, user]);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedEvent(null);
    setEventForm(createEmptyForm());
    setFormError(null);
    setShowFormModal(true);
  };

  const openEditModal = (event) => {
    if (!event || event.status !== EVENT_STATUS.DRAFT) {
      return;
    }

    setModalMode('edit');
    setSelectedEvent(event);
    setEventForm(buildEventForm(event));
    setFormError(null);
    setShowFormModal(true);
  };

  const openDetailModal = (event) => {
    setDetailEvent(event);
    setShowDetailModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setSelectedEvent(null);
    setFormError(null);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailEvent(null);
  };

  const updateSectionField = (index, field, value) => {
    setEventForm((current) => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) => (
        sectionIndex === index ? { ...section, [field]: value } : section
      )),
    }));
  };

  const addSection = () => {
    setEventForm((current) => ({
      ...current,
      sections: [...current.sections, createBlankSection()],
    }));
  };

  const removeSection = (index) => {
    setEventForm((current) => {
      if (current.sections.length <= 1) {
        return current;
      }

      return {
        ...current,
        sections: current.sections.filter((_, sectionIndex) => sectionIndex !== index),
      };
    });
  };

  const buildEventPayload = () => {
    const title = eventForm.title.trim();
    const description = eventForm.description.trim();
    const venue = eventForm.venue.trim();
    const city = eventForm.city.trim();
    const category = eventForm.category.trim();
    const date = eventForm.date.trim();
    const basePrice = Number(eventForm.basePrice);

    if (!title || !description || !venue || !city || !category || !date || Number.isNaN(basePrice)) {
      throw new Error('Complete all required fields before saving the event.');
    }

    const payload = {
      title,
      description,
      venue,
      city,
      category,
      date,
      basePrice,
      posterUrl: eventForm.posterUrl.trim() || undefined,
      tags: parseCsv(eventForm.tags),
    };

    const pricingRulesText = eventForm.pricingRules.trim();
    if (pricingRulesText) {
      const pricingRules = safeJsonParse(pricingRulesText, null);

      if (!pricingRules) {
        throw new Error('Pricing rules must be valid JSON.');
      }

      payload.pricingRules = pricingRules;
    }

    if (modalMode === 'create') {
      const sectionsPayload = buildSectionsPayload(eventForm.sections);
      const isInvalidSection = sectionsPayload.some(
        (section) =>
          !section.name ||
          !section.rows.length ||
          !Number.isFinite(section.seatsPerRow) ||
          section.seatsPerRow <= 0 ||
          !Number.isFinite(section.price) ||
          section.price < 0,
      );

      if (sectionsPayload.length === 0 || isInvalidSection) {
        throw new Error('Add at least one valid section with rows, seats per row, and price.');
      }

      payload.sections = sectionsPayload;
    }

    return payload;
  };

  const handleSubmitEvent = async (submitEvent) => {
    submitEvent.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const payload = buildEventPayload();

      if (modalMode === 'create') {
        const response = await eventService.createEvent(payload);
        const createdEvent = extractSingleEvent(response);
        const currentUser = {
          _id: user?.id || user?._id,
          name: user?.name,
          email: user?.email,
          role: user?.role,
        };

        upsertEventInState({
          ...createdEvent,
          organiser: createdEvent.organiser || currentUser,
          dashboardSections: payload.sections,
        });
      } else if (selectedEvent?._id) {
        const response = await eventService.updateEvent(selectedEvent._id, payload);
        const updatedEvent = extractSingleEvent(response);

        upsertEventInState({
          ...selectedEvent,
          ...updatedEvent,
          dashboardSections: selectedEvent.dashboardSections || [],
        });
      }

      closeFormModal();
      await refreshDashboard(true);
    } catch (submitError) {
      setFormError(submitError.response?.data?.error?.message || submitError.message || 'Unable to save event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishEvent = async (event) => {
    try {
      const response = await eventService.publishEvent(event._id);
      const publishedEvent = extractSingleEvent(response);

      upsertEventInState({
        ...event,
        ...publishedEvent,
        dashboardSections: event.dashboardSections || [],
      });

      if (detailEvent?._id === event._id) {
        setDetailEvent({
          ...event,
          ...publishedEvent,
          dashboardSections: event.dashboardSections || [],
        });
      }

      await refreshDashboard(true);
    } catch (publishError) {
      window.alert(publishError.response?.data?.error?.message || 'Failed to publish the event.');
    }
  };

  const handleCancelEvent = async (event) => {
    if (!window.confirm('Cancel this event? This will keep the record in your dashboard but mark it as cancelled.')) {
      return;
    }

    try {
      await eventService.deleteEvent(event._id);

      const cancelledEvent = {
        ...event,
        status: EVENT_STATUS.CANCELLED,
        dashboardSections: event.dashboardSections || [],
      };

      upsertEventInState(cancelledEvent);

      if (detailEvent?._id === event._id) {
        setDetailEvent(cancelledEvent);
      }

      await refreshDashboard(true);
    } catch (cancelError) {
      window.alert(cancelError.response?.data?.error?.message || 'Failed to cancel the event.');
    }
  };

  const handleRefresh = () => refreshDashboard(true);

  const metrics = Object.values(analyticsById).reduce(
    (accumulator, analytics) => {
      accumulator.revenue += Number(analytics?.totalRevenue || 0);
      accumulator.bookings += Number(analytics?.totalBookings || 0);
      accumulator.totalSeats += Number(analytics?.totalSeats || 0);
      accumulator.soldSeats += Number(analytics?.soldSeats || 0);
      accumulator.availableSeats += Number(analytics?.availableSeats || 0);
      return accumulator;
    },
    {
      revenue: 0,
      bookings: 0,
      totalSeats: 0,
      soldSeats: 0,
      availableSeats: 0,
    },
  );

  if (!metrics.totalSeats) {
    metrics.totalSeats = events.reduce((sum, event) => sum + Number(event.totalSeats || 0), 0);
  }

  if (!metrics.availableSeats) {
    metrics.availableSeats = events.reduce((sum, event) => sum + Number(event.availableSeats || 0), 0);
  }

  const occupancyRate = metrics.totalSeats > 0 ? Math.round((metrics.soldSeats / metrics.totalSeats) * 100) : 0;
  const draftCount = events.filter((event) => event.status === EVENT_STATUS.DRAFT).length;
  const liveCount = events.filter((event) => event.status === EVENT_STATUS.PUBLISHED).length;
  const cancelledCount = events.filter((event) => event.status === EVENT_STATUS.CANCELLED).length;
  const completedCount = events.filter((event) => event.status === EVENT_STATUS.COMPLETED).length;
  const upcomingCount = events.filter(
    (event) => [EVENT_STATUS.DRAFT, EVENT_STATUS.PUBLISHED].includes(event.status) && new Date(event.date).getTime() > Date.now(),
  ).length;

  const filteredEvents = sortDashboardEvents(
    events.filter((event) => {
      const searchText = [
        event.title,
        event.description,
        event.venue,
        event.city,
        event.category,
        event.status,
        event.organiser?.name,
        ...(event.tags || []),
        ...(Array.isArray(event.dashboardSections) ? event.dashboardSections.map((section) => section.name) : []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = !searchQuery.trim() || searchText.includes(searchQuery.trim().toLowerCase());
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    }),
    sortBy,
    analyticsById,
  );
  const hasVisibleEvents = filteredEvents.length > 0;

  const overviewCards = [
    {
      label: 'Managed events',
      value: events.length,
      hint: `${filteredEvents.length} visible after filters`,
      icon: <Layers3 size={18} />,
      tone: 'from-stone-950 to-stone-800',
    },
    {
      label: 'Published live',
      value: liveCount,
      hint: `${upcomingCount} upcoming`,
      icon: <Sparkles size={18} />,
      tone: 'from-emerald-600 to-emerald-500',
    },
    {
      label: 'Revenue',
      value: formatPaise(metrics.revenue),
      hint: `${metrics.bookings} bookings`,
      icon: <DollarSign size={18} />,
      tone: 'from-amber-500 to-orange-500',
    },
    {
      label: 'Occupancy',
      value: `${occupancyRate}%`,
      hint: `${draftCount} drafts in hand`,
      icon: <BarChart3 size={18} />,
      tone: 'from-sky-600 to-cyan-500',
    },
  ];

  const detailAnalytics = detailEvent ? analyticsById[detailEvent._id] : null;
  const detailSections = detailEvent?.dashboardSections ? buildSectionSummary(detailEvent.dashboardSections) : [];
  const detailStatus = detailEvent ? getStatusMeta(detailEvent.status) : STATUS_META[EVENT_STATUS.DRAFT];
  const detailCanEdit = Boolean(detailEvent && (isAdmin || getEventOwnerId(detailEvent) === getUserId(user)) && detailEvent.status === EVENT_STATUS.DRAFT);
  const detailCanPublish = Boolean(detailEvent && (isAdmin || getEventOwnerId(detailEvent) === getUserId(user)) && detailEvent.status === EVENT_STATUS.DRAFT);
  const detailCanCancel = Boolean(detailEvent && (isAdmin || getEventOwnerId(detailEvent) === getUserId(user)) && detailEvent.status !== EVENT_STATUS.CANCELLED && detailEvent.status !== EVENT_STATUS.COMPLETED);
  const detailCategory = detailEvent ? getCategoryLabel(detailEvent.category) : '';

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 selection:bg-[#DC3558] selection:text-white">
      <nav className="fixed top-0 z-50 w-full border-b border-stone-200 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2 text-lg font-black tracking-[0.3em] text-stone-950">
              SEATZO
              <span className="text-[#DC3558]">.</span>
            </span>
            <div className="hidden h-6 w-px bg-stone-200 md:block" />
            <div className="hidden flex-col text-[10px] font-semibold uppercase tracking-[0.35em] text-stone-400 md:flex">
              <span>{isAdmin ? 'Admin dashboard' : 'Organizer dashboard'}</span>
              <span>Real-time operations</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-stone-700 transition-colors hover:border-stone-400 hover:text-stone-950"
            >
              <RefreshCcw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              Refresh
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-white transition-transform hover:-translate-y-0.5"
            >
              <Plus size={14} />
              New event
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-rose-600 transition-colors hover:border-rose-200 hover:bg-rose-50"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <header className="mb-8 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-rose-600">
              <Ticket size={12} />
              Command center
            </p>
            <h1 className="text-4xl font-black tracking-tight text-stone-950 sm:text-5xl lg:text-6xl">
              Event manager.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
              Create events, publish them, monitor occupancy, and keep a live record of drafts, cancellations, and completed shows without leaving the frontend.
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-105">
            {[
              { label: 'Status', value: user?.role === 'admin' ? 'Admin' : 'Organizer' },
              { label: 'Last sync', value: lastSynced ? formatDateTime(lastSynced) : 'Waiting' },
              { label: 'Visible', value: filteredEvents.length },
              { label: 'Saved', value: events.length },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400">{item.label}</p>
                <p className="mt-2 text-sm font-semibold text-stone-950">{item.value}</p>
              </div>
            ))}
          </div>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((card) => (
            <motion.article
              key={card.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className={`overflow-hidden rounded-3xl bg-linear-to-br ${card.tone} p-5 text-white shadow-lg shadow-stone-900/5`}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-white/95">{card.icon}</span>
                <ArrowRight size={16} className="text-white/70" />
              </div>
              <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.35em] text-white/70">{card.label}</p>
              <p className="mt-3 text-3xl font-black tracking-tight">{card.value}</p>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.25em] text-white/70">{card.hint}</p>
            </motion.article>
          ))}
        </section>

        <section className="mb-8 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 xl:grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_auto] xl:items-end">
            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Search</span>
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search title, city, venue, tags"
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 py-3 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-stone-300 focus:border-stone-400 focus:bg-white"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Status</span>
              <div className="relative">
                <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full appearance-none rounded-2xl border border-stone-200 bg-stone-50 py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-stone-400 focus:bg-white"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Category</span>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-colors focus:border-stone-400 focus:bg-white"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Sort</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-colors focus:border-stone-400 focus:bg-white"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setCategoryFilter('all');
                setSortBy('updated-desc');
              }}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-stone-200 bg-white px-5 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-950"
            >
              Reset
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 border-b border-stone-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-rose-600">Your events</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">Live event inventory</h2>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">
              {isRefreshing ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-stone-600">
                  <RefreshCcw size={12} className="animate-spin" />
                  Refreshing
                </span>
              ) : null}
              <span>{filteredEvents.length} visible</span>
              <span>{events.length} saved</span>
            </div>
          </div>

          {isLoading && events.length === 0 ? (
            <div className="py-16">
              <LoadingSpinner />
            </div>
          ) : !hasVisibleEvents ? (
            <>
              {error ? (
                <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

            <div className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center shadow-sm">
              <p className="text-4xl font-black tracking-tight text-stone-300">NO EVENTS.</p>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-stone-500">
                Create an event to start tracking drafts, publishing live listings, and monitoring performance from the same dashboard.
              </p>
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white transition-transform hover:-translate-y-0.5"
              >
                <Plus size={14} />
                Create event
              </button>
            </div>
            </>
          ) : (
            <>
              {error ? (
                <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                  {error}
                </div>
              ) : null}

              <div className="space-y-4">
              {filteredEvents.map((event, index) => {
                const analytics = analyticsById[event._id] || {};
                const totalSeats = Number(analytics.totalSeats || event.totalSeats || 0);
                const availableSeats = Number(analytics.availableSeats ?? event.availableSeats ?? totalSeats);
                const soldSeats = totalSeats > 0 ? totalSeats - availableSeats : Number(analytics.soldSeats || 0);
                const occupancy = totalSeats > 0 ? Math.round((soldSeats / totalSeats) * 100) : 0;
                const statusMeta = getStatusMeta(event.status);
                const canManage = isAdmin || getEventOwnerId(event) === getUserId(user);
                const canEdit = canManage && event.status === EVENT_STATUS.DRAFT;
                const canPublish = canManage && event.status === EVENT_STATUS.DRAFT;
                const canCancel = canManage && event.status !== EVENT_STATUS.CANCELLED && event.status !== EVENT_STATUS.COMPLETED;
                const categoryLabel = getCategoryLabel(event.category);
                const categoryIcon = getCategoryIcon(event.category);
                const sectionBlueprint = buildSectionSummary(event.dashboardSections || []);
                const posterBackground = event.posterUrl
                  ? `url(${event.posterUrl})`
                  : CATEGORY_META[event.category]?.gradient || 'linear-gradient(135deg, #0f172a, #1e293b)';

                return (
                  <motion.article
                    key={event._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm"
                  >
                    <div className="grid lg:grid-cols-[280px_1fr]">
                      <div className="relative min-h-60 overflow-hidden bg-stone-900">
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: posterBackground }}
                        />
                        <div className="absolute inset-0 bg-stone-950/45" />

                        <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
                          <div className="flex items-start justify-between gap-3">
                            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] ${statusMeta.className}`}>
                              {statusMeta.label}
                            </span>

                            <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-white/90 backdrop-blur">
                              {categoryLabel}
                            </span>
                          </div>

                          <div>
                            <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.35em] text-white/75">
                              {categoryIcon}
                              Event blueprint
                            </p>
                            <h3 className="mt-3 text-2xl font-black tracking-tight">{event.title}</h3>
                            <p className="mt-3 text-sm leading-6 text-white/80">{event.venue}</p>
                            <p className="mt-2 inline-flex items-center gap-2 text-sm text-white/75">
                              <MapPin size={14} />
                              {event.city}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 sm:p-8">
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                          <div className="max-w-3xl">
                            <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">
                              <span className="inline-flex items-center gap-1">
                                <Calendar size={12} />
                                {formatDateLabel(event.date)}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Clock3 size={12} />
                                {formatDateTime(event.date)}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Layers3 size={12} />
                                {event.status}
                              </span>
                              {isAdmin && event.organiser?.name ? (
                                <span className="inline-flex items-center gap-1">
                                  <Users size={12} />
                                  {event.organiser.name}
                                </span>
                              ) : null}
                            </div>

                            <p className="mt-4 text-sm leading-7 text-stone-600">{event.description}</p>

                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                              {[
                                { label: 'Revenue', value: formatPaise(analytics.totalRevenue || 0), sub: 'Booked earnings' },
                                { label: 'Bookings', value: Number(analytics.totalBookings || 0), sub: 'Confirmed seats' },
                                { label: 'Occupancy', value: `${occupancy}%`, sub: `${soldSeats}/${totalSeats || event.totalSeats || 0} sold` },
                              ].map((item) => (
                                <div key={item.label} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4">
                                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">{item.label}</p>
                                  <p className="mt-2 text-xl font-black tracking-tight text-stone-950">{item.value}</p>
                                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-stone-400">{item.sub}</p>
                                </div>
                              ))}
                            </div>

                            <div className="mt-6 flex flex-wrap gap-2">
                              {(event.tags || []).map((tag) => (
                                <span
                                  key={`${event._id}-${tag}`}
                                  className="rounded-full border border-stone-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-stone-500"
                                >
                                  #{tag}
                                </span>
                              ))}
                              {!event.tags?.length ? (
                                <span className="rounded-full border border-dashed border-stone-200 bg-stone-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400">
                                  No tags attached
                                </span>
                              ) : null}
                            </div>

                            {sectionBlueprint.length > 0 ? (
                              <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Sections</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {sectionBlueprint.map((section) => {
                                    const sectionStyle = SECTION_COLORS[section.name] || {
                                      bg: '#f1f5f9',
                                      text: '#0f172a',
                                      label: section.name,
                                    };

                                    return (
                                      <span
                                        key={`${event._id}-${section.name}`}
                                        className="rounded-full px-3 py-2 text-xs font-semibold"
                                        style={{ backgroundColor: sectionStyle.bg, color: sectionStyle.text }}
                                      >
                                        {section.name}
                                        {' '}
                                        {section.rows.length} rows x {section.seatsPerRow} seats
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : null}
                          </div>

                          <div className="flex shrink-0 flex-row flex-wrap gap-3 xl:flex-col xl:items-stretch">
                            <button
                              type="button"
                              onClick={() => openDetailModal(event)}
                              className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-700 transition-colors hover:border-stone-400 hover:text-stone-950"
                            >
                              <Eye size={14} />
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditModal(event)}
                              disabled={!canEdit}
                              title={canEdit ? 'Edit draft' : 'Draft events only can be edited'}
                              className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-700 transition-colors hover:border-stone-400 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Edit size={14} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handlePublishEvent(event)}
                              disabled={!canPublish}
                              title={canPublish ? 'Publish draft' : 'Publish is only available for drafts'}
                              className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Send size={14} />
                              Publish
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCancelEvent(event)}
                              disabled={!canCancel}
                              title={canCancel ? 'Cancel event' : 'This event cannot be cancelled'}
                              className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-rose-700 transition-colors hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Trash2 size={14} />
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
              </div>
            </>
          )}
        </section>
      </main>

      <AnimatePresence>
        {showFormModal ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
            onClick={closeFormModal}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-stone-200 p-6 sm:p-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-rose-600">
                    {modalMode === 'create' ? 'Create event' : 'Edit event'}
                  </p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight text-stone-950 sm:text-3xl">
                    {modalMode === 'create' ? 'Build a new listing' : 'Update event metadata'}
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">
                    {modalMode === 'create'
                      ? 'Define the seat blueprint, pricing rule defaults, and event metadata in one pass.'
                      : 'Update the event details that the backend allows while keeping the existing seat blueprint intact.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeFormModal}
                  className="rounded-full border border-stone-200 p-2 text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-950"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-y-auto p-6 sm:p-8">
                {formError ? (
                  <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {formError}
                  </div>
                ) : null}

                {modalMode === 'edit' && selectedEvent ? (
                  <div className="mb-6 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Editing</p>
                    <p className="mt-2 text-sm font-semibold text-stone-950">{selectedEvent.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.3em] text-stone-500">Sections are locked after creation</p>
                  </div>
                ) : null}

                <form onSubmit={handleSubmitEvent} className="space-y-8">
                  <div className="grid gap-6 md:grid-cols-2">
                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Title</span>
                      <input
                        type="text"
                        required
                        value={eventForm.title}
                        onChange={(event) => setEventForm((current) => ({ ...current, title: event.target.value }))}
                        className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-stone-300 focus:border-stone-400 focus:bg-white"
                        placeholder="Summer concert under the lights"
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Description</span>
                      <textarea
                        required
                        rows={4}
                        value={eventForm.description}
                        onChange={(event) => setEventForm((current) => ({ ...current, description: event.target.value }))}
                        className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-stone-300 focus:border-stone-400 focus:bg-white"
                        placeholder="Describe the show, lineup, or experience"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Venue</span>
                      <input
                        type="text"
                        required
                        value={eventForm.venue}
                        onChange={(event) => setEventForm((current) => ({ ...current, venue: event.target.value }))}
                        className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-stone-300 focus:border-stone-400 focus:bg-white"
                        placeholder="Venue name"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">City</span>
                      <input
                        type="text"
                        required
                        value={eventForm.city}
                        onChange={(event) => setEventForm((current) => ({ ...current, city: event.target.value }))}
                        className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-stone-300 focus:border-stone-400 focus:bg-white"
                        placeholder="Mumbai"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Category</span>
                      <select
                        required
                        value={eventForm.category}
                        onChange={(event) => setEventForm((current) => ({ ...current, category: event.target.value }))}
                        className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-colors focus:border-stone-400 focus:bg-white"
                      >
                        {CATEGORY_OPTIONS.filter((option) => option.value !== 'all').map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Event date</span>
                      <input
                        type="datetime-local"
                        required
                        value={eventForm.date}
                        onChange={(event) => setEventForm((current) => ({ ...current, date: event.target.value }))}
                        className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-colors focus:border-stone-400 focus:bg-white"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Base price (paise)</span>
                      <input
                        type="number"
                        min="0"
                        required
                        value={eventForm.basePrice}
                        onChange={(event) => setEventForm((current) => ({ ...current, basePrice: event.target.value }))}
                        className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-stone-300 focus:border-stone-400 focus:bg-white"
                        placeholder="5000"
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Poster URL</span>
                      <input
                        type="url"
                        value={eventForm.posterUrl}
                        onChange={(event) => setEventForm((current) => ({ ...current, posterUrl: event.target.value }))}
                        className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-stone-300 focus:border-stone-400 focus:bg-white"
                        placeholder="https://..."
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Tags</span>
                      <input
                        type="text"
                        value={eventForm.tags}
                        onChange={(event) => setEventForm((current) => ({ ...current, tags: event.target.value }))}
                        className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-stone-300 focus:border-stone-400 focus:bg-white"
                        placeholder="music, live, weekend"
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Pricing rules (JSON)</span>
                      <textarea
                        rows={5}
                        value={eventForm.pricingRules}
                        onChange={(event) => setEventForm((current) => ({ ...current, pricingRules: event.target.value }))}
                        className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 font-mono text-xs leading-6 outline-none transition-colors placeholder:text-stone-300 focus:border-stone-400 focus:bg-white"
                        placeholder={JSON.stringify(DEFAULT_PRICING_RULES, null, 2)}
                      />
                    </label>
                  </div>

                  {modalMode === 'create' ? (
                    <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5 sm:p-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-rose-600">Section blueprint</p>
                          <h4 className="mt-2 text-lg font-black tracking-tight text-stone-950">Seat generation layout</h4>
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
                            Each section defines the rows and seat count that will be generated for the event.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={addSection}
                          className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-700 transition-colors hover:border-stone-400 hover:text-stone-950"
                        >
                          <Plus size={14} />
                          Add section
                        </button>
                      </div>

                      <div className="mt-5 space-y-4">
                        {eventForm.sections.map((section, index) => (
                          <div key={`section-${index}`} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Section {index + 1}</p>
                                <p className="mt-1 text-sm font-semibold text-stone-950">{section.name || 'Untitled section'}</p>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeSection(index)}
                                disabled={eventForm.sections.length === 1}
                                className="rounded-full border border-stone-200 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500 transition-colors hover:border-rose-200 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Remove
                              </button>
                            </div>

                            <div className="mt-4 grid gap-4 md:grid-cols-4">
                              <label className="block">
                                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Name</span>
                                <input
                                  type="text"
                                  value={section.name}
                                  onChange={(event) => updateSectionField(index, 'name', event.target.value)}
                                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-colors focus:border-stone-400 focus:bg-white"
                                  placeholder="PREMIUM"
                                />
                              </label>

                              <label className="block md:col-span-2">
                                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Rows</span>
                                <input
                                  type="text"
                                  value={section.rows}
                                  onChange={(event) => updateSectionField(index, 'rows', event.target.value)}
                                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-colors focus:border-stone-400 focus:bg-white"
                                  placeholder="A, B, C"
                                />
                              </label>

                              <label className="block">
                                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Seats / row</span>
                                <input
                                  type="number"
                                  min="1"
                                  value={section.seatsPerRow}
                                  onChange={(event) => updateSectionField(index, 'seatsPerRow', event.target.value)}
                                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-colors focus:border-stone-400 focus:bg-white"
                                  placeholder="20"
                                />
                              </label>

                              <label className="block">
                                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Price</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={section.price}
                                  onChange={(event) => updateSectionField(index, 'price', event.target.value)}
                                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition-colors focus:border-stone-400 focus:bg-white"
                                  placeholder="5000"
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {modalMode === 'edit' && selectedEvent?.dashboardSections?.length ? (
                    <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5 sm:p-6">
                      <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Cached blueprint</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {buildSectionSummary(selectedEvent.dashboardSections).map((section) => {
                          const sectionStyle = SECTION_COLORS[section.name] || {
                            bg: '#f1f5f9',
                            text: '#0f172a',
                          };

                          return (
                            <span
                              key={`cached-${section.name}`}
                              className="rounded-full px-3 py-2 text-xs font-semibold"
                              style={{ backgroundColor: sectionStyle.bg, color: sectionStyle.text }}
                            >
                              {section.name}
                              {' '}
                              {section.rows.length} rows x {section.seatsPerRow} seats
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-3 border-t border-stone-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-medium uppercase tracking-[0.3em] text-stone-400">
                      {modalMode === 'create'
                        ? 'Seat sections are required on creation and can not be modified later.'
                        : 'Only editable metadata is sent to the backend. Section layouts remain cached locally.'}
                    </p>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Create event' : 'Save changes'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showDetailModal && detailEvent ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm"
            onClick={closeDetailModal}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-stone-200 p-6 sm:p-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-rose-600">Event details</p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight text-stone-950 sm:text-3xl">{detailEvent.title}</h3>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-stone-400">
                    <span className={`rounded-full border px-3 py-1 ${detailStatus.className}`}>{detailStatus.label}</span>
                    <span>{detailCategory}</span>
                    {detailEvent.organiser?.name ? <span>{detailEvent.organiser.name}</span> : null}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeDetailModal}
                  className="rounded-full border border-stone-200 p-2 text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-950"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="border-b border-stone-200 p-6 sm:p-8 lg:border-b-0 lg:border-r">
                  <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDateLabel(detailEvent.date)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 size={12} />
                        {formatDateTime(detailEvent.date)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} />
                        {detailEvent.city}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-stone-600">{detailEvent.description}</p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        { label: 'Revenue', value: formatPaise(detailAnalytics?.totalRevenue || 0) },
                        { label: 'Bookings', value: Number(detailAnalytics?.totalBookings || 0) },
                        { label: 'Occupancy', value: `${detailAnalytics?.occupancyRate ?? occupancyRate}%` },
                        { label: 'Available', value: Number(detailAnalytics?.availableSeats ?? detailEvent.availableSeats ?? 0) },
                      ].map((item) => (
                        <div key={item.label} className="rounded-2xl border border-stone-200 bg-white px-4 py-4 shadow-sm">
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">{item.label}</p>
                          <p className="mt-2 text-lg font-black tracking-tight text-stone-950">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Seat blueprint</p>
                      {detailSections.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {detailSections.map((section) => {
                            const sectionStyle = SECTION_COLORS[section.name] || {
                              bg: '#f1f5f9',
                              text: '#0f172a',
                            };

                            return (
                              <span
                                key={`detail-${section.name}`}
                                className="rounded-full px-3 py-2 text-xs font-semibold"
                                style={{ backgroundColor: sectionStyle.bg, color: sectionStyle.text }}
                              >
                                {section.name}
                                {' '}
                                {section.rows.length} rows x {section.seatsPerRow} seats
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-stone-500">No cached section blueprint is available for this event.</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {(detailEvent.tags || []).map((tag) => (
                      <span
                        key={`detail-tag-${tag}`}
                        className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-stone-500"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Pricing rules</p>
                    <pre className="mt-3 overflow-x-auto rounded-2xl bg-white p-4 text-xs leading-6 text-stone-700 shadow-sm">
                      {JSON.stringify(detailEvent.pricingRules || DEFAULT_PRICING_RULES, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-rose-600">Analytics</p>
                      <h4 className="mt-2 text-lg font-black tracking-tight text-stone-950">Live performance</h4>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500">
                      <TrendingUp size={12} />
                      Real time
                    </span>
                  </div>

                  {detailAnalytics ? (
                    <>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {[
                          { label: 'Sold seats', value: Number(detailAnalytics.soldSeats || 0) },
                          { label: 'Bookings', value: Number(detailAnalytics.totalBookings || 0) },
                          { label: 'Total seats', value: Number(detailAnalytics.totalSeats || detailEvent.totalSeats || 0) },
                          { label: 'Revenue', value: formatPaise(detailAnalytics.totalRevenue || 0) },
                        ].map((item) => (
                          <div key={item.label} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">{item.label}</p>
                            <p className="mt-2 text-lg font-black tracking-tight text-stone-950">{item.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Bookings by date</p>
                        <div className="mt-4 space-y-3">
                          {(detailAnalytics.bookingsByDate || []).length > 0 ? (
                            detailAnalytics.bookingsByDate.map((entry) => {
                              const maxValue = Math.max(...detailAnalytics.bookingsByDate.map((item) => Number(item.count || 0)), 1);
                              const width = Math.max((Number(entry.count || 0) / maxValue) * 100, 6);

                              return (
                                <div key={entry._id}>
                                  <div className="flex items-center justify-between gap-4 text-xs font-semibold text-stone-500">
                                    <span>{formatDateLabel(entry._id)}</span>
                                    <span>{entry.count} bookings</span>
                                  </div>
                                  <div className="mt-2 h-2 rounded-full bg-stone-100">
                                    <div
                                      className="h-2 rounded-full bg-stone-950"
                                      style={{ width: `${width}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-sm text-stone-500">No booking trend data is available yet.</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-stone-400">Seat breakdown</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(detailAnalytics.seatBreakdown || []).map((entry) => (
                            <span
                              key={entry._id}
                              className="rounded-full border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-600"
                            >
                              {entry._id}: {entry.count}
                            </span>
                          ))}
                          {(detailAnalytics.seatBreakdown || []).length === 0 ? (
                            <p className="text-sm text-stone-500">No seat breakdown is available yet.</p>
                          ) : null}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-6 text-sm text-stone-500">
                      Analytics are loading or unavailable for this event.
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3 border-t border-stone-200 pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        closeDetailModal();
                        openCreateModal();
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-700 transition-colors hover:border-stone-400 hover:text-stone-950"
                    >
                      <Plus size={14} />
                      New event
                    </button>

                    {detailCanEdit ? (
                      <button
                        type="button"
                        onClick={() => {
                          closeDetailModal();
                          openEditModal(detailEvent);
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-700 transition-colors hover:border-stone-400 hover:text-stone-950"
                      >
                        <Edit size={14} />
                        Edit draft
                      </button>
                    ) : null}

                    {detailCanPublish ? (
                      <button
                        type="button"
                        onClick={() => handlePublishEvent(detailEvent)}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-100"
                      >
                        <Send size={14} />
                        Publish
                      </button>
                    ) : null}

                    {detailCanCancel ? (
                      <button
                        type="button"
                        onClick={() => handleCancelEvent(detailEvent)}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-rose-700 transition-colors hover:border-rose-300 hover:bg-rose-100"
                      >
                        <Trash2 size={14} />
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default OrganizerDashboard;