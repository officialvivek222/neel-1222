import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerEnquiry, EnquiryStatus } from '../../types';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Trash2,
  Phone,
  Scissors,
  Check,
  X,
  Eye,
  BadgePercent,
  Sparkles,
  ExternalLink,
  MessageCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export const EnquiriesQuotationsView: React.FC = () => {
  const {
    enquiryList,
    updateEnquiryQuotation,
    updateEnquiryStatus,
    deleteEnquiry,
    businessSettings
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<CustomerEnquiry | null>(null);

  // Quotation form state for modal
  const [quoteAmount, setQuoteAmount] = useState<number>(500);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [quoteNotes, setQuoteNotes] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  // Filtered list
  const filteredList = useMemo(() => {
    return enquiryList.filter((item) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        item.customerName.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        item.service.toLowerCase().includes(q) ||
        (item.message && item.message.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [enquiryList, searchTerm, statusFilter]);

  // Top stats
  const totalEnquiries = enquiryList.length;
  const newCount = enquiryList.filter((e) => e.status === 'new').length;
  const quotedCount = enquiryList.filter((e) => e.status === 'quoted').length;
  const completedCount = enquiryList.filter((e) => e.status === 'completed').length;

  const handleOpenQuotationModal = (enquiry: CustomerEnquiry) => {
    setSelectedEnquiry(enquiry);
    setQuoteAmount(enquiry.quotationAmount > 0 ? enquiry.quotationAmount : 500);
    setDiscountAmount(enquiry.discountAmount || 0);
    setQuoteNotes(enquiry.notes || 'Includes hair wash, precision cut & premium styling finish.');
    setIsCopied(false);
  };

  const finalPayable = Math.max(0, quoteAmount - discountAmount);

  // Clean phone number for WhatsApp wa.me link
  const getCleanPhone = (rawPhone: string) => {
    const digits = rawPhone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `91${digits}`; // Add India country code by default if 10 digits
    }
    return digits;
  };

  // Build professional WhatsApp message
  const generateWhatsAppMessage = () => {
    if (!selectedEnquiry) return '';
    const salonName = businessSettings.businessName || 'Neel Hair Salon';
    const salonAddress = businessSettings.businessAddress || 'Balad Road, Jalgaon, Maharashtra';
    const salonContact = businessSettings.contactNumber || '+91 99223 44401';

    return `✂️ *${salonName.toUpperCase()} - SERVICE QUOTATION* ✂️

Dear *${selectedEnquiry.customerName}*,
Thank you for your enquiry with *${salonName}*! Here are the quotation details for your requested service:

• *Service:* ${selectedEnquiry.service}
• *Standard Estimate:* ₹${quoteAmount}
${discountAmount > 0 ? `• *Special Discount:* -₹${discountAmount}\n` : ''}• *Final Payable Amount:* *₹${finalPayable}*

${quoteNotes ? `📝 *Notes:* ${quoteNotes}\n` : ''}📍 *Salon Address:* ${salonAddress}
📞 *Direct Helpline:* ${salonContact}

Kindly reply to this message to confirm your appointment timing. We look forward to welcoming you!`;
  };

  const handleSendWhatsApp = async () => {
    if (!selectedEnquiry) return;

    await updateEnquiryQuotation(selectedEnquiry.id, {
      quotationAmount: quoteAmount,
      discountAmount,
      finalAmount: finalPayable,
      notes: quoteNotes,
      status: 'quoted'
    });

    const msg = generateWhatsAppMessage();
    const cleanPhone = getCleanPhone(selectedEnquiry.phone);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setSelectedEnquiry(null);
  };

  const handleCopyMessage = async () => {
    const msg = generateWhatsAppMessage();
    try {
      await navigator.clipboard.writeText(msg);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* 4 TOP KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Enquiries */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Enquiries
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalEnquiries}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              <span>Active</span>
            </span>
          </div>
        </div>

        {/* New / Pending Requests */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              New Requests
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {newCount}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              <span>Needs Quote</span>
            </span>
          </div>
        </div>

        {/* Quotations Sent */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Quotations Sent
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {quotedCount}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              <span>WhatsApp</span>
            </span>
          </div>
        </div>

        {/* Completed / Booked */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-100 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Bookings Completed
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {completedCount}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <span>Converted</span>
            </span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, phone, or service..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-600 focus:ring-3 focus:ring-purple-100 text-xs sm:text-sm font-semibold text-slate-800 transition-all outline-none"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          {[
            { id: 'all', label: 'All Requests' },
            { id: 'new', label: 'New' },
            { id: 'quoted', label: 'Quoted' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ENQUIRIES LIST / TABLE */}
      <div className="bg-white rounded-3xl shadow-card border border-slate-100 overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <FileText className="w-7 h-7" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900 mb-1">
              No Customer Enquiries Found
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
              When clients submit an enquiry or request a salon service quotation, their requests will appear here instantly.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Service</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Quotation</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((enquiry) => {
                  const cleanPhone = getCleanPhone(enquiry.phone);
                  const isQuoted = enquiry.status === 'quoted';
                  const isCompleted = enquiry.status === 'completed';

                  return (
                    <tr key={enquiry.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Customer Name & Phone */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {enquiry.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">
                              {enquiry.customerName}
                            </span>
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 mt-0.5"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>{enquiry.phone}</span>
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Service */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 font-semibold text-xs">
                          <Scissors className="w-3 h-3" />
                          <span>{enquiry.service}</span>
                        </span>
                        {enquiry.message && (
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 italic max-w-xs">
                            "{enquiry.message}"
                          </p>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-slate-500 font-medium whitespace-nowrap">
                        {enquiry.createdAt}
                      </td>

                      {/* Quotation */}
                      <td className="py-4 px-6">
                        {enquiry.finalAmount > 0 ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-sm">
                              ₹{enquiry.finalAmount}
                            </span>
                            {enquiry.discountAmount > 0 && (
                              <span className="text-[10px] text-emerald-600 font-semibold">
                                Discount: -₹{enquiry.discountAmount}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">
                            Pending quote
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            enquiry.status === 'new'
                              ? 'bg-amber-100 text-amber-800'
                              : enquiry.status === 'quoted'
                              ? 'bg-blue-100 text-blue-800'
                              : enquiry.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              enquiry.status === 'new'
                                ? 'bg-amber-500'
                                : enquiry.status === 'quoted'
                                ? 'bg-blue-500'
                                : enquiry.status === 'completed'
                                ? 'bg-emerald-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          <span className="capitalize">{enquiry.status}</span>
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenQuotationModal(enquiry)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                            title="Generate or edit quotation"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{isQuoted ? 'Resend Quote' : 'Create Quote'}</span>
                          </button>

                          {!isCompleted ? (
                            <button
                              onClick={() => updateEnquiryStatus(enquiry.id, 'completed')}
                              className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                              title="Mark as Completed"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => updateEnquiryStatus(enquiry.id, 'quoted')}
                              className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
                              title="Revert to Quoted"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => deleteEnquiry(enquiry.id)}
                            className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Enquiry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QUOTATION BUILDER & WHATSAPP MODAL */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedEnquiry(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  WhatsApp Quotation Builder
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Compose, calculate and dispatch quotation to customer
                </p>
              </div>
            </div>

            {/* Customer Details Pill */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Customer
                </span>
                <span className="font-bold text-slate-800 text-sm">
                  {selectedEnquiry.customerName}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Service Requested
                </span>
                <span className="font-bold text-purple-700 text-sm">
                  {selectedEnquiry.service}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Phone Number
                </span>
                <span className="font-bold text-slate-800 text-sm">
                  {selectedEnquiry.phone}
                </span>
              </div>
            </div>

            {/* Quotation Calculator Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Base Amount */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Estimated Service Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-600 focus:ring-3 focus:ring-purple-100 text-sm font-bold text-slate-900 outline-none"
                />
              </div>

              {/* Discount Amount */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Discount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-600 focus:ring-3 focus:ring-purple-100 text-sm font-bold text-emerald-700 outline-none"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-xs font-bold text-slate-700">
                Salon Notes &amp; Inclusions
              </label>
              <textarea
                rows={2}
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
                placeholder="e.g. Includes hair wash, consultation & styling finish..."
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-600 focus:ring-3 focus:ring-purple-100 text-xs sm:text-sm font-medium text-slate-800 outline-none resize-none"
              />
            </div>

            {/* Total Summary Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white mb-6 flex items-center justify-between shadow-lg shadow-purple-600/20">
              <div className="flex flex-col">
                <span className="text-xs text-purple-200 uppercase font-bold tracking-wider">
                  Final Payable Amount
                </span>
                <span className="text-2xl font-extrabold tracking-tight">
                  ₹{finalPayable}
                </span>
              </div>
              <span className="text-xs bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full font-bold">
                {discountAmount > 0 ? `Saved ₹${discountAmount}` : 'Standard Rate'}
              </span>
            </div>

            {/* Live WhatsApp Message Preview */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Live WhatsApp Preview</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied!' : 'Copy Text'}</span>
                </button>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#e5ddd5]/30 border border-slate-200 text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                {generateWhatsAppMessage()}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="px-5 py-3 rounded-2xl text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Dispatch to WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
