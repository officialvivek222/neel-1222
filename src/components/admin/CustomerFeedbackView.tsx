import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { FeedbackItem, FeedbackStatus } from '../../types';
import {
  MessageSquare,
  Star,
  CheckCircle2,
  TrendingUp,
  Search,
  Filter,
  Download,
  MoreVertical,
  Scissors,
  Check,
  Clock,
  Trash2,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Phone
} from 'lucide-react';

export const CustomerFeedbackView: React.FC = () => {
  const {
    stats,
    feedbackList,
    updateFeedbackStatus,
    deleteFeedback,
    exportFeedbackCSV
  } = useApp();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected feedback for detail modal
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Available unique services from data
  const services = useMemo(() => {
    const set = new Set(feedbackList.map((f) => f.service));
    return Array.from(set);
  }, [feedbackList]);

  // Filtered feedbacks
  const filteredList = useMemo(() => {
    return feedbackList.filter((item) => {
      // Search text match
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        item.customerName.toLowerCase().includes(q) ||
        item.service.toLowerCase().includes(q) ||
        item.feedbackText.toLowerCase().includes(q);

      // Rating match
      const matchesRating =
        ratingFilter === 'all' || item.rating === Number(ratingFilter);

      // Service match
      const matchesService =
        serviceFilter === 'all' || item.service === serviceFilter;

      // Status match
      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter;

      return matchesSearch && matchesRating && matchesService && matchesStatus;
    });
  }, [feedbackList, searchTerm, ratingFilter, serviceFilter, statusFilter]);

  // Paginated items
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;

  // Auto-clamp page if filters change
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Click outside listener to close row action menu
  React.useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    if (activeMenuId) {
      window.addEventListener('click', handleOutsideClick);
      return () => window.removeEventListener('click', handleOutsideClick);
    }
  }, [activeMenuId]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  const handleToggleStatus = (item: FeedbackItem) => {
    const nextStatus: FeedbackStatus =
      item.status === 'resolved' ? 'pending' : 'resolved';
    updateFeedbackStatus(item.id, nextStatus);
    setActiveMenuId(null);
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* 4 TOP STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Feedback */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Feedback
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.feedbackReceived}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" />
              <span>+{stats.feedbackGrowth}%</span>
            </span>
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Average Rating
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats.averageRating}
              </span>
              <span className="text-slate-400 font-bold text-sm">/ 5</span>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              High Satisfaction
            </span>
          </div>
        </div>

        {/* 5 Star Feedback */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              5 Star Feedback
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <div className="flex -space-x-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.fiveStarCount}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" />
              <span>+{stats.fiveStarGrowth}%</span>
            </span>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Resolved
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.resolvedCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {Math.round((stats.resolvedCount / (stats.feedbackReceived || 1)) * 100)}% handled
            </span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full lg:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search feedback (name, service, message...)"
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-purple-600 focus:ring-3 focus:ring-purple-100 text-xs sm:text-sm font-medium transition-all outline-none"
          />
        </div>

        {/* Filter Dropdowns + CSV Export */}
        <div className="w-full lg:w-auto flex flex-wrap items-center gap-2.5">
          {/* Ratings Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">⭐ All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          {/* Services Filter */}
          <select
            value={serviceFilter}
            onChange={(e) => {
              setServiceFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">✂️ All Services</option>
            {services.map((svc) => (
              <option key={svc} value={svc}>
                {svc}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">📊 All Status</option>
            <option value="resolved">Resolved</option>
            <option value="pending">Pending</option>
          </select>

          {/* Export CSV button */}
          <button
            onClick={exportFeedbackCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 hover:border-purple-300 text-xs font-bold shadow-xs transition-all cursor-pointer ml-auto"
          >
            <Download className="w-3.5 h-3.5 text-purple-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK TABLE (DESKTOP) & CARD VIEW (MOBILE) */}
      <div className="bg-white rounded-3xl shadow-card border border-slate-100 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-4 px-4 w-12 text-center">#</th>
                <th className="py-4 px-4">Customer</th>
                <th className="py-4 px-4">Rating</th>
                <th className="py-4 px-4">Service</th>
                <th className="py-4 px-4 min-w-[280px]">Feedback</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-600">No customer feedback recorded yet</p>
                    <p className="text-xs text-slate-400 mt-1">Customer submissions from QR scans will appear here live in real-time.</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                const isResolved = item.status === 'resolved';

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-purple-50/20 transition-colors group cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    {/* Index */}
                    <td className="py-4 px-4 text-center font-semibold text-slate-400">
                      {globalIndex}
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {item.customerAvatar || item.customerName.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900 whitespace-nowrap">
                          {item.customerName}
                        </span>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= item.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </td>

                    {/* Service */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-100/60">
                        <Scissors className="w-3 h-3 text-blue-500" />
                        <span>{item.service}</span>
                      </span>
                    </td>

                    {/* Feedback Text */}
                    <td className="py-4 px-4">
                      <p className="text-slate-600 line-clamp-2 italic font-normal">
                        "{item.feedbackText}"
                      </p>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 whitespace-nowrap font-medium text-slate-500">
                      {item.createdAt}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(item);
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          isResolved
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {isResolved ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Resolved</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Pending</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Action Dropdown */}
                    <td className="py-4 px-4 text-center relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() =>
                          setActiveMenuId(activeMenuId === item.id ? null : item.id)
                        }
                        className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === item.id && (
                        <div className="absolute right-4 mt-1 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100 text-left">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-semibold"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>View Details</span>
                          </button>
                          <button
                            onClick={() => handleToggleStatus(item)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-semibold"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Toggle Status</span>
                          </button>
                          <button
                            onClick={() => {
                              deleteFeedback(item.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View */}
        <div className="md:hidden divide-y divide-slate-100">
          {paginatedItems.length === 0 ? (
            <div className="py-8 text-center text-slate-400 p-4">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">No customer feedback yet</p>
              <p className="text-xs text-slate-400 mt-1">Feedback will appear here live when submitted.</p>
            </div>
          ) : (
            paginatedItems.map((item, index) => {
            const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
            const isResolved = item.status === 'resolved';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="p-4 flex flex-col gap-3 hover:bg-purple-50/10 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">#{globalIndex}</span>
                    <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                      {item.customerAvatar || item.customerName.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-900 text-sm">{item.customerName}</span>
                  </div>

                  {/* Status */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStatus(item);
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      isResolved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {isResolved ? 'Resolved' : 'Pending'}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          s <= item.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                    {item.service}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 italic">
                  "{item.feedbackText}"
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>{item.createdAt}</span>
                  <span className="text-purple-600 font-semibold">Tap to view &rarr;</span>
                </div>
              </div>
            );
          }))}
        </div>

        {/* Empty State */}
        {filteredList.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800">No feedback found</h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Try adjusting your search query or filter settings.
            </p>
          </div>
        )}

        {/* PAGINATION FOOTER */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-semibold">
          <span>
            Showing {filteredList.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
            {Math.min(currentPage * itemsPerPage, filteredList.length)} of{' '}
            {filteredList.length} feedbacks
          </span>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-xl font-bold text-xs transition-all ${
                  currentPage === page
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* FEEDBACK DETAIL MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-purple-500/20">
                {selectedItem.customerAvatar || selectedItem.customerName.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {selectedItem.customerName}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedItem.createdAt} • {selectedItem.service}
                </p>
              </div>
            </div>

            {/* Stars & Badge */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 mb-4 border border-slate-100">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= selectedItem.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
                <span className="ml-2 text-xs font-bold text-slate-800">
                  {selectedItem.rating} out of 5 stars
                </span>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedItem.status === 'resolved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {selectedItem.status === 'resolved' ? 'Resolved' : 'Pending Review'}
              </span>
            </div>

            {/* Quoted Feedback */}
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 mb-6">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block mb-1">
                Customer Message
              </span>
              <p className="text-sm text-slate-800 italic leading-relaxed">
                "{selectedItem.feedbackText}"
              </p>
            </div>

            {/* Contact details if available */}
            {selectedItem.phone && (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-6">
                <Phone className="w-3.5 h-3.5 text-purple-600" />
                <span>Contact: {selectedItem.phone}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  deleteFeedback(selectedItem.id);
                  setSelectedItem(null);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                Delete Feedback
              </button>

              <button
                onClick={() => {
                  handleToggleStatus(selectedItem);
                  setSelectedItem({
                    ...selectedItem,
                    status: selectedItem.status === 'resolved' ? 'pending' : 'resolved'
                  });
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer"
              >
                {selectedItem.status === 'resolved'
                  ? 'Mark as Pending'
                  : 'Mark as Resolved'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
