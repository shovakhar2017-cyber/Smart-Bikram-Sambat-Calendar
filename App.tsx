/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Languages, 
  Moon, 
  Sun, 
  Image as ImageIcon, 
  X,
  Palette,
  Calendar as CalendarIcon,
  Maximize,
  Minimize,
  Minus,
  Plus,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import NepaliDate from 'nepali-date-converter';
import { 
  BS_MONTHS_NP, 
  BS_MONTHS_EN, 
  AD_MONTHS_EN, 
  WEEKDAYS_NP, 
  WEEKDAYS_EN, 
  HOLIDAYS_2083, 
  MOTIVATIONAL_QUOTES,
  NEPAL_THEMED_IMAGES
} from './lib/calendarData';
import { cn, formatNepaliNumber } from './lib/utils';
import { Language, Theme, Layout, CalendarSettings, Holiday } from './types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { calculatePanchanga } from './services/panchangaService';

export default function App() {
  // State
  const [currentBSYear, setCurrentBSYear] = useState(2083);
  const [currentBSMonth, setCurrentBSMonth] = useState(0); // 0-indexed (Baisakh)
  const [settings, setSettings] = useState<CalendarSettings>(() => {
    const saved = localStorage.getItem('calendar-settings');
    const defaultSettings: CalendarSettings = {
      language: 'np',
      theme: 'light',
      layout: 'decorative',
      imageFit: 'cover',
      imageZoom: 1,
      customColor: '#e11d48', // Rose 600
      monthImages: {},
    };
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadYear, setDownloadYear] = useState(2083);
  const [downloadType, setDownloadType] = useState<'single' | 'full'>('single');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [selectedDay, setSelectedDay] = useState<{ day: number, month: number, year: number } | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('calendar-settings', JSON.stringify(settings));
  }, [settings]);

  // Derived Data
  const lang = settings.language;
  const isDark = settings.theme === 'dark';
  const monthName = lang === 'np' ? BS_MONTHS_NP[currentBSMonth] : BS_MONTHS_EN[currentBSMonth];
  const yearDisplay = lang === 'np' ? formatNepaliNumber(currentBSYear) : currentBSYear;
  
  // Get days in month and starting weekday
  const getMonthData = () => {
    const nepaliDate = new NepaliDate(currentBSYear, currentBSMonth, 1);
    // In version 3.x of nepali-date-converter, getDaysInMonth might not be available on the instance.
    // We can find the number of days by going to the next month and subtracting one day.
    let nextMonth = currentBSMonth + 1;
    let nextYear = currentBSYear;
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear++;
    }
    const firstDayNextMonth = new NepaliDate(nextYear, nextMonth, 1);
    const lastDayThisMonth = new NepaliDate(firstDayNextMonth.toJsDate().getTime() - 24 * 60 * 60 * 1000);
    const daysInMonth = lastDayThisMonth.getDate();
    
    const firstDayWeekday = nepaliDate.getDay(); // 0-6 (Sun-Sat)
    
    // Get AD range
    const firstDayAD = nepaliDate.toJsDate();
    const lastDayAD = lastDayThisMonth.toJsDate();
    
    const adRange = `${AD_MONTHS_EN[firstDayAD.getMonth()]} - ${AD_MONTHS_EN[lastDayAD.getMonth()]} ${firstDayAD.getFullYear()}`;
    
    return { daysInMonth, firstDayWeekday, adRange };
  };

  const { daysInMonth, firstDayWeekday, adRange } = getMonthData();

  const currentMonthImage = settings.monthImages?.[`${currentBSYear}-${currentBSMonth}`] || 
    NEPAL_THEMED_IMAGES[currentBSMonth % NEPAL_THEMED_IMAGES.length];

  // Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({
          ...prev,
          monthImages: {
            ...(prev.monthImages || {}),
            [`${currentBSYear}-${currentBSMonth}`]: reader.result as string
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSettings(prev => {
      const newImages = { ...(prev.monthImages || {}) };
      delete newImages[`${currentBSYear}-${currentBSMonth}`];
      return { ...prev, monthImages: newImages };
    });
  };

  const nextMonth = () => {
    if (currentBSMonth === 11) {
      setCurrentBSMonth(0);
      setCurrentBSYear(prev => prev + 1);
    } else {
      setCurrentBSMonth(prev => prev + 1);
    }
  };

  const prevMonth = () => {
    if (currentBSMonth === 0) {
      setCurrentBSMonth(11);
      setCurrentBSYear(prev => prev - 1);
    } else {
      setCurrentBSMonth(prev => prev - 1);
    }
  };

  const nextYear = () => {
    setCurrentBSYear(prev => prev + 1);
  };

  const prevYear = () => {
    setCurrentBSYear(prev => prev - 1);
  };

  const exportPDF = async (year: number, month?: number) => {
    setIsExporting(true);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const monthsToExport = month !== undefined ? [month] : Array.from({ length: 12 }, (_, i) => i);
    const originalYear = currentBSYear;
    const originalMonth = currentBSMonth;

    try {
      for (let i = 0; i < monthsToExport.length; i++) {
        const m = monthsToExport[i];
        // Temporarily switch view to the month being exported
        setCurrentBSYear(year);
        setCurrentBSMonth(m);
        
        // Wait for React to render and images to load
        await new Promise(resolve => setTimeout(resolve, 800));

        if (calendarRef.current) {
          const canvas = await html2canvas(calendarRef.current, {
            scale: 2,
            useCORS: true,
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
            logging: false
          });
          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          
          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        }
      }

      pdf.save(`Smart_Calendar_${year}${month !== undefined ? `_${BS_MONTHS_EN[month]}` : ''}.pdf`);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      // Restore original view
      setCurrentBSYear(originalYear);
      setCurrentBSMonth(originalMonth);
      setIsExporting(false);
      setShowDownloadModal(false);
    }
  };

  // Theme colors
  const primaryColor = settings.customColor || '#e11d48';

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300 font-sans",
      isDark ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"
    )}>
      {/* Header */}
      <header className={cn(
        "sticky top-0 z-40 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between",
        isDark ? "bg-gray-950/80 border-gray-800" : "bg-white/80 border-gray-200"
      )}>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-rose-600" style={{ color: primaryColor }} />
          <h1 className="text-xl font-bold tracking-tight">
            {lang === 'np' ? 'स्मार्ट पात्रो' : 'Smart Calendar'}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              const today = new NepaliDate();
              setCurrentBSYear(today.getYear());
              setCurrentBSMonth(today.getMonth());
            }}
            className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            title="Go to Today"
          >
            <CalendarIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setSettings(prev => ({ ...prev, language: lang === 'np' ? 'en' : 'np' }))}
            className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            title="Switch Language"
          >
            <Languages className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setSettings(prev => ({ ...prev, theme: isDark ? 'light' : 'dark' }))}
            className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowDownloadModal(true)}
            disabled={isExporting}
            className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            title="Export PDF"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 pb-24">
        {/* Calendar Container */}
        <div 
          ref={calendarRef}
          className={cn(
            "rounded-3xl overflow-hidden shadow-2xl transition-all duration-500",
            isDark ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-100",
            settings.layout === 'decorative' ? "p-1" : "p-0"
          )}
        >
          {/* Cover Image */}
          <div className="relative h-48 sm:h-56 overflow-hidden group bg-gray-100 dark:bg-gray-800">
            <img 
              src={currentMonthImage} 
              alt="Cover"
              className={cn(
                "w-full h-full transition-transform duration-300",
                settings.imageFit === 'contain' ? "object-contain" : "object-cover"
              )}
              style={{ 
                transform: `scale(${settings.imageZoom || 1})`,
              }}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                  {monthName} {yearDisplay}
                </h2>
                <p className="text-white/80 text-sm font-medium drop-shadow-md">
                  {adRange}
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSettings(prev => ({ ...prev, imageFit: prev.imageFit === 'contain' ? 'cover' : 'contain' }))}
                  className="p-2 bg-white/20 backdrop-blur-md rounded-xl cursor-pointer hover:bg-white/40 transition-colors"
                  title={settings.imageFit === 'contain' ? "Crop to Fill" : "Fit to View"}
                >
                  {settings.imageFit === 'contain' ? <Maximize className="w-5 h-5 text-white" /> : <Minimize className="w-5 h-5 text-white" />}
                </button>
                {settings.monthImages?.[`${currentBSYear}-${currentBSMonth}`] && (
                  <button 
                    onClick={removeImage}
                    className="p-2 bg-rose-500/80 backdrop-blur-md rounded-xl cursor-pointer hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                )}
                <label className="p-2 bg-white/20 backdrop-blur-md rounded-xl cursor-pointer hover:bg-white/40 transition-colors">
                  <ImageIcon className="w-5 h-5 text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-4 py-4 border-b dark:border-gray-800">
            <div className="flex gap-1">
              <button 
                onClick={prevYear}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={lang === 'np' ? 'अघिल्लो वर्ष' : 'Previous Year'}
              >
                <ChevronsLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={prevMonth}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={lang === 'np' ? 'अघिल्लो महिना' : 'Previous Month'}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {lang === 'np' ? 'नेभिगेसन' : 'Navigation'}
              </span>
            </div>

            <div className="flex gap-1">
              <button 
                onClick={nextMonth}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={lang === 'np' ? 'अर्को महिना' : 'Next Month'}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button 
                onClick={nextYear}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={lang === 'np' ? 'अर्को वर्ष' : 'Next Year'}
              >
                <ChevronsRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid with Swipe */}
          <motion.div 
            key={`${currentBSYear}-${currentBSMonth}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 100) prevMonth();
              else if (info.offset.x < -100) nextMonth();
            }}
            className="p-4 sm:p-6"
          >
            {/* Weekdays */}
            <div className="grid grid-cols-7 mb-4">
              {(lang === 'np' ? WEEKDAYS_NP : WEEKDAYS_EN).map((day, i) => (
                <div 
                  key={day} 
                  className={cn(
                    "text-center text-xs font-bold uppercase tracking-tighter",
                    i === 6 ? "text-rose-500" : i === 5 ? "text-blue-500" : "text-gray-400"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {/* Empty cells for padding */}
              {Array.from({ length: firstDayWeekday }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {/* Actual days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const bsDateStr = `${currentBSYear}-${String(currentBSMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                // Only show holidays for 2083 for now, or add more logic here
                const holiday = HOLIDAYS_2083.find(h => h.date === bsDateStr);
                const weekdayIndex = (firstDayWeekday + i) % 7;
                const isWeekend = weekdayIndex === 6 || weekdayIndex === 5; // Saturday (6) and Friday (5)
                const isToday = () => {
                  const today = new NepaliDate();
                  return today.getYear() === currentBSYear && 
                         today.getMonth() === currentBSMonth && 
                         today.getDate() === day;
                };

                const adDate = new NepaliDate(currentBSYear, currentBSMonth, day).toJsDate();
                const panchanga = calculatePanchanga(adDate, bsDateStr);

                return (
                  <motion.div
                    key={day}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      if (holiday) setSelectedHoliday(holiday);
                      setSelectedDay({ day, month: currentBSMonth, year: currentBSYear });
                    }}
                    className={cn(
                      "aspect-square relative flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer group overflow-hidden",
                      isToday() ? "ring-2 ring-rose-500 bg-rose-50 dark:bg-rose-900/20" : "hover:bg-gray-100 dark:hover:bg-gray-800",
                      holiday?.isPublic ? "bg-rose-50 dark:bg-rose-900/10" : ""
                    )}
                  >
                    {/* Panchanga Details */}
                    <div className="absolute left-0.5 top-1/2 -translate-y-1/2 text-[7px] sm:text-[8px] opacity-70 font-medium vertical-text text-gray-500 dark:text-gray-400">
                      {lang === 'np' ? panchanga.tithi_np : panchanga.tithi}
                    </div>
                    
                    <span className={cn(
                      "text-base sm:text-lg font-bold leading-none z-10",
                      holiday?.isPublic ? "text-rose-600" : isWeekend ? "text-rose-400" : "text-inherit"
                    )}>
                      {lang === 'np' ? formatNepaliNumber(day) : day}
                    </span>
                    
                    <span className="text-[9px] sm:text-[10px] text-gray-400 group-hover:text-gray-500 transition-colors mt-0.5 z-10">
                      {adDate.getDate()}
                    </span>

                    {/* Events Indicator */}
                    {panchanga.events.length > 0 && (
                      <div className="absolute bottom-1 flex gap-0.5">
                        {panchanga.events.map((_, idx) => (
                          <div key={idx} className="w-1 h-1 rounded-full bg-blue-500" />
                        ))}
                      </div>
                    )}
                    
                    {holiday?.isPublic && (
                      <>
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-sm bg-rose-500 z-20" />
                        <div className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[6px] sm:text-[7px] opacity-70 font-medium vertical-text text-rose-500 dark:text-rose-400 max-h-[80%] overflow-hidden truncate z-10">
                          {lang === 'np' ? holiday.nameNp : holiday.nameEn}
                        </div>
                      </>
                    )}
                    
                    {/* Tooltip for Holiday */}
                    {holiday && (
                      <div className="absolute bottom-full mb-2 hidden group-hover:block z-50">
                        <div className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                          {lang === 'np' ? holiday.nameNp : holiday.nameEn}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Quote Section */}
          <div className={cn(
            "p-6 border-t dark:border-gray-800 text-center italic",
            isDark ? "bg-gray-900/50" : "bg-gray-50"
          )}>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              "{lang === 'np' ? MOTIVATIONAL_QUOTES[currentBSMonth % MOTIVATIONAL_QUOTES.length].textNp : MOTIVATIONAL_QUOTES[currentBSMonth % MOTIVATIONAL_QUOTES.length].textEn}"
            </p>
            <cite className="text-xs font-semibold text-gray-500 not-italic">
              — {lang === 'np' ? MOTIVATIONAL_QUOTES[currentBSMonth % MOTIVATIONAL_QUOTES.length].authorNp : MOTIVATIONAL_QUOTES[currentBSMonth % MOTIVATIONAL_QUOTES.length].authorEn}
            </cite>
          </div>
        </div>
      </main>

      {/* Settings Overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: 100, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 100, scale: 0.95 }}
              className={cn(
                "w-full max-w-md rounded-3xl overflow-hidden shadow-2xl",
                isDark ? "bg-gray-900 border border-gray-800" : "bg-white"
              )}
            >
              <div className="p-6 border-b dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {lang === 'np' ? 'सेटिङहरू' : 'Settings'}
                </h3>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Theme Toggle */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    {lang === 'np' ? 'थिम' : 'Theme'}
                  </label>
                  <div className="flex gap-2">
                    {['light', 'dark'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setSettings(prev => ({ ...prev, theme: t as Theme }))}
                        className={cn(
                          "flex-1 py-3 rounded-2xl border-2 transition-all font-medium capitalize",
                          settings.theme === t 
                            ? "border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400" 
                            : "border-transparent bg-gray-100 dark:bg-gray-800 text-gray-500"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layout Toggle */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    {lang === 'np' ? 'लेआउट' : 'Layout'}
                  </label>
                  <div className="flex gap-2">
                    {['minimal', 'decorative'].map((l) => (
                      <button
                        key={l}
                        onClick={() => setSettings(prev => ({ ...prev, layout: l as Layout }))}
                        className={cn(
                          "flex-1 py-3 rounded-2xl border-2 transition-all font-medium capitalize",
                          settings.layout === l 
                            ? "border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400" 
                            : "border-transparent bg-gray-100 dark:bg-gray-800 text-gray-500"
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Customization */}
                <div className="space-y-4 pt-4 border-t dark:border-gray-800">
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    {lang === 'np' ? 'फोटो सेटिङ' : 'Photo Settings'}
                  </label>
                  
                  <div className="space-y-3">
                    <label className="text-xs text-gray-400">
                      {lang === 'np' ? 'फोटो साइज' : 'Photo Size'}
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSettings(prev => ({ ...prev, imageFit: 'cover' }))}
                        className={cn(
                          "flex-1 py-2 rounded-xl border-2 transition-all text-sm font-medium",
                          settings.imageFit === 'cover' 
                            ? "border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400" 
                            : "border-transparent bg-gray-100 dark:bg-gray-800 text-gray-500"
                        )}
                      >
                        {lang === 'np' ? 'क्रप (Crop)' : 'Crop (Cover)'}
                      </button>
                      <button
                        onClick={() => setSettings(prev => ({ ...prev, imageFit: 'contain' }))}
                        className={cn(
                          "flex-1 py-2 rounded-xl border-2 transition-all text-sm font-medium",
                          settings.imageFit === 'contain' 
                            ? "border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400" 
                            : "border-transparent bg-gray-100 dark:bg-gray-800 text-gray-500"
                        )}
                      >
                        {lang === 'np' ? 'फिट (Fit)' : 'Fit (Contain)'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs text-gray-400">
                        {lang === 'np' ? 'जुम (Zoom)' : 'Zoom'}
                      </label>
                      <span className="text-xs font-mono text-rose-500">
                        {Math.round((settings.imageZoom || 1) * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSettings(prev => ({ ...prev, imageZoom: Math.max(0.5, (prev.imageZoom || 1) - 0.1) }))}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="3" 
                        step="0.1"
                        value={settings.imageZoom || 1}
                        onChange={(e) => setSettings(prev => ({ ...prev, imageZoom: parseFloat(e.target.value) }))}
                        className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                      />
                      <button
                        onClick={() => setSettings(prev => ({ ...prev, imageZoom: Math.min(3, (prev.imageZoom || 1) + 0.1) }))}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setSettings(prev => ({ ...prev, imageFit: 'cover', imageZoom: 1 }))}
                    className="w-full py-2 text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
                  >
                    {lang === 'np' ? 'फोटो सेटिङ रिसेट गर्नुहोस्' : 'Reset Photo Settings'}
                  </button>
                </div>

                {/* Custom Color */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    {lang === 'np' ? 'मुख्य रङ' : 'Primary Color'}
                  </label>
                  <div className="flex gap-3">
                    {['#e11d48', '#2563eb', '#16a34a', '#d97706', '#7c3aed'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setSettings(prev => ({ ...prev, customColor: color }))}
                        className={cn(
                          "w-10 h-10 rounded-xl border-4 transition-all",
                          settings.customColor === color ? "border-white ring-2 ring-gray-300" : "border-transparent"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full py-4 rounded-2xl bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-colors"
                  style={{ backgroundColor: primaryColor }}
                >
                  {lang === 'np' ? 'बचत गर्नुहोस्' : 'Save & Close'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Download Modal */}
      <AnimatePresence>
        {showDownloadModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-md rounded-3xl overflow-hidden shadow-2xl",
                isDark ? "bg-gray-900 border border-gray-800" : "bg-white"
              )}
            >
              <div className="p-6 border-b dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  {lang === 'np' ? 'पात्रो डाउनलोड' : 'Download Calendar'}
                </h3>
                <button 
                  onClick={() => setShowDownloadModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    {lang === 'np' ? 'वर्ष चयन गर्नुहोस्' : 'Select Year (BS)'}
                  </label>
                  <input 
                    type="number" 
                    value={downloadYear}
                    onChange={(e) => setDownloadYear(parseInt(e.target.value))}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 transition-all font-bold text-lg",
                      isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-100"
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    {lang === 'np' ? 'डाउनलोड प्रकार' : 'Download Type'}
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDownloadType('single')}
                      className={cn(
                        "flex-1 py-3 rounded-2xl border-2 transition-all font-medium",
                        downloadType === 'single' 
                          ? "border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400" 
                          : "border-transparent bg-gray-100 dark:bg-gray-800 text-gray-500"
                      )}
                    >
                      {lang === 'np' ? 'यो महिना' : 'This Month'}
                    </button>
                    <button
                      onClick={() => setDownloadType('full')}
                      className={cn(
                        "flex-1 py-3 rounded-2xl border-2 transition-all font-medium",
                        downloadType === 'full' 
                          ? "border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400" 
                          : "border-transparent bg-gray-100 dark:bg-gray-800 text-gray-500"
                      )}
                    >
                      {lang === 'np' ? 'पूरा वर्ष' : 'Full Year'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
                <button 
                  onClick={() => exportPDF(downloadYear, downloadType === 'single' ? currentBSMonth : undefined)}
                  className="w-full py-4 rounded-2xl bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Download className="w-5 h-5" />
                  {lang === 'np' ? 'डाउनलोड सुरु गर्नुहोस्' : 'Start Download'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Day Detail Modal */}
      <AnimatePresence>
        {selectedDay && (() => {
          const adDate = new NepaliDate(selectedDay.year, selectedDay.month, selectedDay.day).toJsDate();
          const bsDateStr = `${selectedDay.year}-${String(selectedDay.month + 1).padStart(2, '0')}-${String(selectedDay.day).padStart(2, '0')}`;
          const panchanga = calculatePanchanga(adDate, bsDateStr);
          const holiday = HOLIDAYS_2083.find(h => h.date === bsDateStr);
          
          return (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              onClick={() => {
                setSelectedDay(null);
                setSelectedHoliday(null);
              }}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl",
                  isDark ? "bg-gray-900 border border-gray-800" : "bg-white"
                )}
              >
                <div className="p-6 border-b dark:border-gray-800 flex items-center justify-between">
                  <div className="flex flex-col">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-rose-500" />
                      {lang === 'np' ? formatNepaliNumber(selectedDay.day) : selectedDay.day} {lang === 'np' ? BS_MONTHS_NP[selectedDay.month] : BS_MONTHS_EN[selectedDay.month]} {lang === 'np' ? formatNepaliNumber(selectedDay.year) : selectedDay.year}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">
                      {adDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedDay(null);
                      setSelectedHoliday(null);
                    }}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  {/* Holiday Section */}
                  {holiday && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="text-2xl font-bold text-rose-600 leading-tight">
                            {holiday.nameNp}
                          </h4>
                          {holiday.isPublic && (
                            <span className="shrink-0 px-2.5 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-black uppercase tracking-wider border border-green-200 dark:border-green-800/50 flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-sm bg-green-500 animate-pulse" />
                              Public
                            </span>
                          )}
                        </div>
                        <h5 className="text-lg font-medium text-gray-500 dark:text-gray-400">
                          {holiday.nameEn}
                        </h5>
                      </div>

                      {(holiday.descriptionNp || holiday.descriptionEn) && (
                        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 space-y-3 shadow-sm">
                          {holiday.descriptionNp && (
                            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 font-medium">
                              {holiday.descriptionNp}
                            </p>
                          )}
                          {holiday.descriptionNp && holiday.descriptionEn && (
                            <div className="h-px bg-rose-200/50 dark:bg-rose-800/50" />
                          )}
                          {holiday.descriptionEn && (
                            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 italic">
                              {holiday.descriptionEn}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Panchanga Section */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700 space-y-3">
                      <div className="flex items-center justify-between border-b dark:border-gray-700 pb-2">
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Tithi / तिथि</p>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{panchanga.tithi_np}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">{panchanga.tithi}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Paksha / पक्ष</p>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{panchanga.paksha_np}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">{panchanga.paksha}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Events Section */}
                  {panchanga.events.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-gray-400 uppercase font-bold px-1">Events / विशेष उत्सव</p>
                      <div className="space-y-2">
                        {panchanga.events.map((event, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                            <div className="w-2 h-2 rounded-sm bg-blue-500" />
                            <p className="text-sm font-bold text-blue-700 dark:text-blue-300">{event}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
                  <button 
                    onClick={() => {
                      setSelectedDay(null);
                      setSelectedHoliday(null);
                    }}
                    className="w-full py-4 rounded-2xl bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-colors"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {lang === 'np' ? 'बन्द गर्नुहोस्' : 'Close'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Exporting Overlay */}
      {isExporting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-white font-bold text-xl animate-pulse">
              {lang === 'np' ? 'पीडीएफ तयार हुँदैछ...' : 'Generating PDF...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
