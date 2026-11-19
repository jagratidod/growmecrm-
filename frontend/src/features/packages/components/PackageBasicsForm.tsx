import React, { useState } from 'react'
import {
  Sparkles,
  CheckCircle2,
  UploadCloud,
  Plus,
  Trash2,
  Link as LinkIcon,
  Layers,
  ArrowRight,
  ArrowLeft,
  X,
  Tag,
} from 'lucide-react'
import { usePackages } from '../../../context/PackagesContext'
import { useToast } from '../../../components/ui/Toast'
import type { BrochureDesign, PricingOption } from '../../../types/package.types'

interface PackageBasicsFormProps {
  onNext: () => void
  onBack: () => void
}

export const PackageBasicsForm: React.FC<PackageBasicsFormProps> = ({ onNext, onBack }) => {
  const { activePackage, savePackage } = usePackages()
  const { toast } = useToast()

  // Form State
  const [brochureDesign, setBrochureDesign] = useState<BrochureDesign>(
    activePackage?.brochureDesign || 'Signature'
  )
  const [template, setTemplate] = useState(activePackage?.template || '')
  const [name, setName] = useState(activePackage?.name || 'BALI_V1_2026')
  const [code, setCode] = useState(activePackage?.code || '')
  const [categories, setCategories] = useState<string[]>(
    activePackage?.categories || ['Honeymoon', 'Adventure']
  )
  const [newCategoryInput, setNewCategoryInput] = useState('')
  const [slug, setSlug] = useState(activePackage?.slug || 'bali-v1-2026')
  const [nights, setNights] = useState<number>(activePackage?.duration?.nights || 1)
  const [days, setDays] = useState<number>(activePackage?.duration?.days || 2)
  const [bookingTitle, setBookingTitle] = useState(activePackage?.bookingTitle || '')
  const [destination, setDestination] = useState(activePackage?.destination || 'Bali, Indonesia')
  const [price, setPrice] = useState<number>(activePackage?.price || 13999)
  const [originalPrice, setOriginalPrice] = useState<number>(activePackage?.originalPrice || 16000)
  const [currency, setCurrency] = useState(activePackage?.currency || 'INR')
  const [route, setRoute] = useState(activePackage?.route || 'Delhi to Delhi')
  const [bookingAmount, setBookingAmount] = useState<number>(activePackage?.bookingAmount || 5000)

  // Pricing Options
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>(
    activePackage?.pricingOptions || [
      { id: '1', label: 'Double Sharing (Per Person)', price: 13999 },
      { id: '2', label: 'Single Occupancy Villa', price: 21999 },
    ]
  )
  const [isAddingPrice, setIsAddingPrice] = useState(false)
  const [newPriceLabel, setNewPriceLabel] = useState('')
  const [newPriceValue, setNewPriceValue] = useState<number>(0)
  const [newPriceIsPeak, setNewPriceIsPeak] = useState(false)

  // Media & URLs
  const [bannerImage, setBannerImage] = useState(activePackage?.bannerImage || '')
  const [whatsappBannerImage, setWhatsappBannerImage] = useState(
    activePackage?.whatsappBannerImage || ''
  )
  const [showBannerUrlInput, setShowBannerUrlInput] = useState(false)
  const [showWaBannerUrlInput, setShowWaBannerUrlInput] = useState(false)

  // Descriptions & Contacts
  const [whatsappDesc, setWhatsappDesc] = useState(activePackage?.whatsappDescription || '')
  const [description, setDescription] = useState(activePackage?.description || '')
  const [contactNumber, setContactNumber] = useState(activePackage?.contactNumber || '+91-XXXX-XXXX')
  const [contactEmail, setContactEmail] = useState(activePackage?.contactEmail || 'hello@example.com')
  const [isAiGenerating, setIsAiGenerating] = useState(false)

  // Sync slug with name if slug was auto-generated
  const handleNameChange = (val: string) => {
    setName(val)
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
    setSlug(generatedSlug)
  }

  // Handle template selection
  const handleTemplateChange = (tmpl: string) => {
    setTemplate(tmpl)
    if (tmpl === 'Bali Honeymoon & Leisure') {
      setName('BALI_PARADISE_2026')
      setDestination('Bali, Indonesia')
      setNights(4)
      setDays(5)
      setPrice(18500)
      setOriginalPrice(22000)
      setRoute('Mumbai to Bali')
      setBookingTitle('Bali Honeymoon Retreat with Private Luxury Pool Villa')
      setCategories(['Honeymoon', 'Luxury', 'Beach'])
      setDescription('Romantic getaway featuring private pool villa, Uluwatu sunset temple tour, Kecak dance, and Nusa Penida island speedboat cruise.')
      setWhatsappDesc('🌴 Book our Bali 5D/4N Honeymoon Special with private villa & romantic dinners @ ₹18,500!')
    } else if (tmpl === 'Kashmir Snow & Houseboat') {
      setName('KASHMIR_WONDER_2026')
      setDestination('Srinagar & Gulmarg, Kashmir')
      setNights(5)
      setDays(6)
      setPrice(24999)
      setOriginalPrice(29999)
      setRoute('Delhi to Srinagar')
      setBookingTitle('Kashmir Winter Wonder: Dal Lake Houseboat & Gulmarg Gondola')
      setCategories(['Snow', 'Mountains', 'Family'])
      setDescription('Unforgettable journey to Kashmir featuring deluxe houseboat stay, Dal Lake shikara ride, Gulmarg snow gondola cable car, and Pahalgam valley.')
      setWhatsappDesc('❄️ Kashmir 6D/5N Winter Paradise with Gulmarg Gondola & Houseboat @ ₹24,999!')
    } else if (tmpl === 'Goa Beach & Heritage') {
      setName('GOA_SUN_SAND_2026')
      setDestination('North & South Goa, India')
      setNights(3)
      setDays(4)
      setPrice(8999)
      setOriginalPrice(11500)
      setRoute('Bangalore to Goa')
      setBookingTitle('Goa Weekend Escape: Beaches, Water Sports & Heritage')
      setCategories(['Weekend', 'Beach', 'Nightlife'])
      setDescription('Relaxing coastal holiday covering Candolim beach, watersports at Calangute, Fontainhas heritage walk, and Mandovi river cruise.')
      setWhatsappDesc('🌊 Goa 4D/3N Beach Getaway @ ₹8,999 with complimentary watersports!')
    }
    toast({ title: `Template applied: ${tmpl}`, type: 'success' })
  }

  // Category addition
  const handleAddCategory = () => {
    if (!newCategoryInput.trim()) return
    const cat = newCategoryInput.trim()
    if (!categories.includes(cat)) {
      setCategories((prev) => [...prev, cat])
    }
    setNewCategoryInput('')
  }

  const handleRemoveCategory = (cat: string) => {
    setCategories((prev) => prev.filter((c) => c !== cat))
  }

  // Pricing options addition
  const handleAddPricingOption = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPriceLabel.trim() || newPriceValue <= 0) {
      toast({ title: 'Please provide valid price label and amount', type: 'error' })
      return
    }

    const newOption: PricingOption = {
      id: `po-${Date.now()}`,
      label: newPriceLabel.trim(),
      price: Number(newPriceValue),
      isPeakSeason: newPriceIsPeak,
    }

    setPricingOptions((prev) => [...prev, newOption])
    setNewPriceLabel('')
    setNewPriceValue(0)
    setNewPriceIsPeak(false)
    setIsAddingPrice(false)
    toast({ title: 'Pricing option added', type: 'success' })
  }

  const handleRemovePricingOption = (id: string) => {
    setPricingOptions((prev) => prev.filter((p) => p.id !== id))
  }

  // AI Generation Simulation
  const handleAiAutoGenerate = () => {
    setIsAiGenerating(true)
    setTimeout(() => {
      const dest = destination || 'Bali, Indonesia'
      setBookingTitle(`Explore ${dest}: Curated ${nights}N/${days}D Luxury Holiday Experience`)
      setDescription(
        `Discover the captivating highlights of ${dest} on an expertly crafted ${nights} nights / ${days} days tour. Features premium accommodations, private transfers, guided excursions, and authentic local culinary experiences designed for memorable travel.`
      )
      setWhatsappDesc(
        `✈️ Limited offer! Experience ${dest} (${nights}N/${days}D) starting at just ₹${price.toLocaleString(
          'en-IN'
        )}. Reserve your seat now with advance deposit of ₹${bookingAmount.toLocaleString('en-IN')}.`
      )
      setIsAiGenerating(false)
      toast({
        title: 'Gemini AI generated description & WhatsApp pitch!',
        type: 'success',
      })
    }, 900)
  }

  // Handle local image upload simulation
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setter(reader.result)
          toast({ title: 'Image uploaded successfully', type: 'success' })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Save current step data into context
  const handleProceed = async () => {
    if (!name.trim()) {
      toast({ title: 'Please enter package name', type: 'error' })
      return
    }
    if (!destination.trim()) {
      toast({ title: 'Please enter destination', type: 'error' })
      return
    }

    await savePackage({
      name: name.trim(),
      code: code.trim() || undefined,
      brochureDesign,
      template,
      categories,
      slug: slug.trim(),
      duration: { nights: Number(nights) || 1, days: Number(days) || 2 },
      bookingTitle: bookingTitle.trim() || undefined,
      destination: destination.trim(),
      price: Number(price) || 0,
      originalPrice: Number(originalPrice) || undefined,
      currency,
      route: route.trim() || undefined,
      bookingAmount: Number(bookingAmount) || 0,
      pricingOptions,
      bannerImage,
      whatsappBannerImage,
      whatsappDescription: whatsappDesc.trim() || undefined,
      description: description.trim() || undefined,
      contactNumber: contactNumber.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
    })

    onNext()
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-200">
      {/* 1. Brochure Design Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Brochure design</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            How this package's PDF looks. Fill the details and photos below — the brochure builds itself in this design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Signature Design Card */}
          <div
            onClick={() => setBrochureDesign('Signature')}
            className={`relative rounded-2xl p-5 border-2 transition-all cursor-pointer flex gap-4 ${
              brochureDesign === 'Signature'
                ? 'border-[#453372] bg-purple-50/20 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            {/* Visual Booklet Illustration */}
            <div className="w-16 h-20 rounded-lg border-2 border-amber-400 bg-white p-1.5 flex flex-col justify-between shrink-0 shadow-2xs">
              <div className="w-4 h-4 rounded-full bg-sky-200 mx-auto" />
              <div className="space-y-1">
                <div className="h-1.5 bg-[#453372] rounded-full w-full" />
                <div className="h-1.5 bg-sky-400 rounded-full w-3/4 mx-auto" />
              </div>
              <div className="h-3 bg-teal-100 rounded-sm w-full" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-slate-900 text-sm">Signature</h4>
                {brochureDesign === 'Signature' && (
                  <CheckCircle2 className="w-4 h-4 text-[#453372]" />
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Bordered booklet — clean pages, prices table, colour themes.
              </p>
            </div>
          </div>

          {/* Adventure Design Card */}
          <div
            onClick={() => setBrochureDesign('Adventure')}
            className={`relative rounded-2xl p-5 border-2 transition-all cursor-pointer flex gap-4 ${
              brochureDesign === 'Adventure'
                ? 'border-[#453372] bg-purple-50/20 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            {/* Visual Adventure Booklet Illustration */}
            <div className="w-16 h-20 rounded-lg bg-sky-100 p-1.5 flex flex-col justify-between shrink-0 border border-sky-300 shadow-2xs">
              <div className="text-[9px] font-black tracking-widest text-amber-500 text-center uppercase">
                TRIP
              </div>
              <div className="h-2 bg-blue-700 rounded-xs w-4/5 mx-auto" />
              <div className="h-2 bg-gradient-to-r from-amber-400 to-blue-800 rounded-xs w-full" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-slate-900 text-sm">Adventure</h4>
                {brochureDesign === 'Adventure' && (
                  <CheckCircle2 className="w-4 h-4 text-[#453372]" />
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Group-trip brochure — big gold title, day-by-day photo pages, batch dates, booking & handbook.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Start from a template */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 text-[#453372] flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Start from a template</h4>
            <p className="text-xs text-slate-500">Pre-fills the structure & look. Optional.</p>
          </div>
        </div>

        <select
          value={template}
          onChange={(e) => handleTemplateChange(e.target.value)}
          className="w-full sm:w-64 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372]"
        >
          <option value="">Choose a template...</option>
          <option value="Bali Honeymoon & Leisure">Bali Honeymoon & Leisure (5D/4N)</option>
          <option value="Kashmir Snow & Houseboat">Kashmir Snow & Houseboat (6D/5N)</option>
          <option value="Goa Beach & Heritage">Goa Beach & Heritage (4D/3N)</option>
        </select>
      </div>

      {/* 3. Let AI draft this package Banner */}
      <div className="bg-gradient-to-r from-[#453372] to-[#5a3e98] rounded-2xl p-5 sm:p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-purple-200 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Let AI draft this package
            </h4>
            <p className="text-xs text-purple-200 mt-0.5">
              Gemini writes the description, itinerary, inclusions, highlights & FAQs from your basics.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAiAutoGenerate}
          disabled={isAiGenerating}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#453372] hover:bg-purple-50 text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-[0.98] shrink-0"
        >
          <Sparkles className="w-4 h-4 text-[#453372]" />
          <span>{isAiGenerating ? 'Generating...' : 'Auto-generate'}</span>
        </button>
      </div>

      {/* 4. Package Name & Code */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Package name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. BALI_V1_2026"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Package code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Optional"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372]"
            />
            <p className="text-[11px] text-slate-400 mt-1">Auto-generated if left blank.</p>
          </div>
        </div>

        {/* 5. Package Categories Box */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-3">
          <div>
            <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Package Categories
            </h5>
            <p className="text-xs text-slate-500 mt-0.5">
              Create your own categories and assign multiple to this package.
            </p>
          </div>

          {categories.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs"
                >
                  <Tag className="w-3 h-3 text-[#453372]" />
                  <span>{cat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(cat)}
                    className="hover:text-rose-500 text-slate-400 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No categories yet.</p>
          )}

          <div className="flex items-center gap-2 max-w-md pt-1">
            <input
              type="text"
              placeholder="e.g. Honeymoon, Adventure..."
              value={newCategoryInput}
              onChange={(e) => setNewCategoryInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddCategory()
                }
              }}
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372]"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add category</span>
            </button>
          </div>
        </div>

        {/* 6. Public URL slug */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">Public URL slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto-generated-from-name"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372]"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Auto-generated from the name. Lowercase letters, numbers, hyphens.
          </p>
        </div>

        {/* 7. Duration & Booking Title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Duration <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={nights}
                onChange={(e) => setNights(parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-2 rounded-xl border border-slate-200 text-sm text-center text-slate-900"
              />
              <span className="text-xs font-medium text-slate-500">Nights</span>
              <input
                type="number"
                min="1"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2 rounded-xl border border-slate-200 text-sm text-center text-slate-900"
              />
              <span className="text-xs font-medium text-slate-500">Days</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Booking title</label>
            <input
              type="text"
              value={bookingTitle}
              onChange={(e) => setBookingTitle(e.target.value)}
              placeholder="Public booking page header."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372]"
            />
            <p className="text-[11px] text-slate-400 mt-1">Public booking page header.</p>
          </div>
        </div>

        {/* 8. Destination, Price & Original Price */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Destination <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Bali, Indonesia"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Price <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={price || ''}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              placeholder="13999"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Original price</label>
            <input
              type="number"
              min="0"
              value={originalPrice || ''}
              onChange={(e) => setOriginalPrice(parseFloat(e.target.value) || 0)}
              placeholder="16000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372]"
            />
            <p className="text-[11px] text-slate-400 mt-1">Shown struck-through as a discount.</p>
          </div>
        </div>

        {/* 9. Currency, Route & Booking Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372]"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="AED">AED (د.إ)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Route</label>
            <input
              type="text"
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              placeholder="Delhi to Delhi"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372]"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Where the trip starts and ends — shown on the brochure cover.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Booking amount</label>
            <input
              type="number"
              min="0"
              value={bookingAmount || ''}
              onChange={(e) => setBookingAmount(parseFloat(e.target.value) || 0)}
              placeholder="5000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372]"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Advance that books a seat ("Book now @ ₹{bookingAmount.toLocaleString('en-IN')}").
            </p>
          </div>
        </div>

        {/* 10. Pricing Options Box */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
          <div>
            <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              PRICING OPTIONS
            </h5>
            <p className="text-xs text-slate-500 mt-0.5">
              Add any number of labelled prices — e.g. Single / Double / Triple sharing, Child With Bed, Extra Bed. Tag any as Peak season (Christmas/New Year etc.) to show them as a separate pricing block on the brochure.
            </p>
          </div>

          {/* List of pricing options */}
          {pricingOptions.length > 0 && (
            <div className="space-y-2">
              {pricingOptions.map((opt) => (
                <div
                  key={opt.id}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{opt.label}</span>
                    {opt.isPeakSeason && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                        Peak Season
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#453372]">
                      ₹{opt.price.toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePricingOption(opt.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Price Form / Button */}
          {isAddingPrice ? (
            <form
              onSubmit={handleAddPricingOption}
              className="bg-white border border-purple-200 rounded-xl p-4 space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Label (e.g. Double sharing, Child with Bed)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Triple Sharing Deluxe"
                    value={newPriceLabel}
                    onChange={(e) => setNewPriceLabel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="12999"
                    value={newPriceValue || ''}
                    onChange={(e) => setNewPriceValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={newPriceIsPeak}
                    onChange={(e) => setNewPriceIsPeak(e.target.checked)}
                    className="w-4 h-4 rounded text-[#453372] focus:ring-[#453372]"
                  />
                  <span>Tag as Peak Season price block</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingPrice(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-[#453372] text-white rounded-lg hover:bg-[#37275d]"
                  >
                    Add Option
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingPrice(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add price</span>
            </button>
          )}
        </div>

        {/* 11. Image Upload Dropzones (2 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Banner image */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Banner image</label>
            <div className="border border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-purple-50/20 transition-all cursor-pointer relative group overflow-hidden">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => handleImageUpload(e, setBannerImage)}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />

              {bannerImage ? (
                <div className="relative w-full h-32 rounded-xl overflow-hidden">
                  <img
                    src={bannerImage}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold">
                    Click to change image
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-[#453372] flex items-center justify-center mb-2">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">Upload image</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Drag & drop or click · PNG/JPG/WEBP · max 5 MB
                  </p>
                </>
              )}
            </div>

            <div className="mt-2">
              {showBannerUrlInput ? (
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/banner.jpg"
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowBannerUrlInput(false)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowBannerUrlInput(true)}
                  className="text-[11px] text-slate-500 hover:text-[#453372] flex items-center gap-1 font-medium"
                >
                  <LinkIcon className="w-3 h-3" />
                  <span>or paste an image URL</span>
                </button>
              )}
            </div>
          </div>

          {/* WhatsApp banner image */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              WhatsApp banner image
            </label>
            <div className="border border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-purple-50/20 transition-all cursor-pointer relative group overflow-hidden">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => handleImageUpload(e, setWhatsappBannerImage)}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />

              {whatsappBannerImage ? (
                <div className="relative w-full h-32 rounded-xl overflow-hidden">
                  <img
                    src={whatsappBannerImage}
                    alt="WhatsApp banner preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold">
                    Click to change image
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-[#453372] flex items-center justify-center mb-2">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">Upload image</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Drag & drop or click · PNG/JPG/WEBP · max 5 MB
                  </p>
                </>
              )}
            </div>

            <div className="mt-2">
              {showWaBannerUrlInput ? (
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/wa-banner.jpg"
                    value={whatsappBannerImage}
                    onChange={(e) => setWhatsappBannerImage(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWaBannerUrlInput(false)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowWaBannerUrlInput(true)}
                  className="text-[11px] text-slate-500 hover:text-[#453372] flex items-center gap-1 font-medium"
                >
                  <LinkIcon className="w-3 h-3" />
                  <span>or paste an image URL</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Used when shared on WhatsApp. Leave empty to reuse the banner.
            </p>
          </div>
        </div>

        {/* 12. WhatsApp description */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            WhatsApp description
          </label>
          <textarea
            rows={2}
            value={whatsappDesc}
            onChange={(e) => setWhatsappDesc(e.target.value)}
            placeholder="Short pitch for WhatsApp..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] resize-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Caption sent when this package is shared on WhatsApp. Plain text only.
          </p>
        </div>

        {/* 13. Full Description */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write package description..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] resize-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Full package description shown on the public page.
          </p>
        </div>

        {/* 14. Contact Number & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Contact number</label>
            <input
              type="text"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="+91-XXXX-XXXX"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Contact email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="hello@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372]"
            />
          </div>
        </div>
      </div>

      {/* 15. Bottom Navigation Bar */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleProceed}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#453372] hover:bg-[#37275d] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all active:scale-[0.98]"
        >
          <span>Next: Itinerary</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
