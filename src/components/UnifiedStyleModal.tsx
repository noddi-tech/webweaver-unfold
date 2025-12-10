import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Settings, Palette, Type, Image as ImageIcon, MousePointer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getColorTokenOptions, calculateContrastRatio, getContrastLevel, normalizeColorToken } from '@/lib/colorUtils';
import { cn } from '@/lib/utils';
import { useColorSystem } from '@/hooks/useColorSystem';
import type { ColorOption } from '@/config/colorSystem';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { UnifiedStyleModalLayoutTab } from './UnifiedStyleModalLayoutTab';
import { getBackgroundStyleFromToken } from '@/lib/backgroundUtils';
import { resolveTextColor } from '@/lib/textColorUtils';
import { CardStylePresetPicker } from '@/components/design-system/CardStylePresetPicker';

interface SubElement {
  id: string;
  label: string;
  type: 'text' | 'color' | 'background' | 'image' | 'url';
  value: string;
}

interface UnifiedStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  elementIdPrefix: string;
  initialData?: {
    background?: string;
    number?: string;
    numberColor?: string;
    title?: string;
    titleColor?: string;
    description?: string;
    descriptionColor?: string;
    ctaText?: string;
    ctaUrl?: string;
    ctaBgColor?: string;
    ctaTextColor?: string;
    iconColor?: string;
  };
  onSave?: (data: any) => void;
}

export function UnifiedStyleModal({
  isOpen,
  onClose,
  elementIdPrefix,
  initialData = {},
  onSave,
}: UnifiedStyleModalProps) {
  const [activeTab, setActiveTab] = useState('background');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State for all editable elements
  const [background, setBackground] = useState(initialData.background || 'bg-card');
  const [iconCardBg, setIconCardBg] = useState('bg-white/10');
  const [imageContainerBg, setImageContainerBg] = useState('bg-transparent');
  const [number, setNumber] = useState(initialData.number || '');
  const [numberColor, setNumberColor] = useState(initialData.numberColor || 'foreground');
  const [title, setTitle] = useState(initialData.title || '');
  const [titleColor, setTitleColor] = useState(initialData.titleColor || 'foreground');
  const [description, setDescription] = useState(initialData.description || '');
  const [descriptionColor, setDescriptionColor] = useState(initialData.descriptionColor || 'muted-foreground');
  const [ctaText, setCtaText] = useState(initialData.ctaText || '');
  const [ctaUrl, setCtaUrl] = useState(initialData.ctaUrl || '');
  const [ctaBgColor, setCtaBgColor] = useState(initialData.ctaBgColor || 'primary');
  const [ctaTextColor, setCtaTextColor] = useState(initialData.ctaTextColor || 'primary-foreground');
  const [iconColor, setIconColor] = useState(initialData.iconColor || 'foreground');
  const [iconSize, setIconSize] = useState('default');
  
  // Card layout settings
  const [cardHeight, setCardHeight] = useState('h-[500px]');
  const [cardWidth, setCardWidth] = useState('w-full');
  const [cardBorderRadius, setCardBorderRadius] = useState('rounded-2xl');
  const [cardGap, setCardGap] = useState('gap-8');
  const [cardShadow, setCardShadow] = useState('shadow-none');

  // Load actual saved data from database when modal opens
  useEffect(() => {
    if (!isOpen || !elementIdPrefix) return;
    
    const loadSavedData = async () => {
      setLoading(true);
      try {
        // Load background AND text_color_class AND shadow_class
        const { data: bgData } = await supabase
          .from('background_styles')
          .select('background_class, text_color_class, shadow_class')
          .eq('element_id', `${elementIdPrefix}-background`)
          .maybeSingle();

        // Load icon color and size from icon_styles table
        const { data: iconStyleData } = await supabase
          .from('icon_styles')
          .select('icon_color_token, size')
          .eq('element_id', `${elementIdPrefix}-icon`)
          .maybeSingle();
        
        if (iconStyleData?.icon_color_token) {
          setIconColor(iconStyleData.icon_color_token);
        }
        if (iconStyleData?.size) {
          setIconSize(iconStyleData.size);
        }
        
        if (bgData?.background_class) {
          setBackground(bgData.background_class);
        }
        
        // Load text color from background_styles and apply to all text elements
        if (bgData?.text_color_class) {
          setTitleColor(bgData.text_color_class);
          setDescriptionColor(bgData.text_color_class);
          setNumberColor(bgData.text_color_class);
          setIconColor(bgData.text_color_class);
        }
        
        // Load shadow class
        if (bgData?.shadow_class) {
          setCardShadow(bgData.shadow_class);
        }

        // Load icon card background
        const { data: iconBgData } = await supabase
          .from('background_styles')
          .select('background_class')
          .eq('element_id', `${elementIdPrefix}-icon-card`)
          .maybeSingle();
        
        if (iconBgData?.background_class) {
          setIconCardBg(iconBgData.background_class);
        }

        // Load image container background
        const { data: imageContainerBgData } = await supabase
          .from('background_styles')
          .select('background_class')
          .eq('element_id', `${elementIdPrefix}-image-container`)
          .maybeSingle();
        
        if (imageContainerBgData?.background_class) {
          setImageContainerBg(imageContainerBgData.background_class);
        }
        
        // Load text elements
        const elements = ['number', 'title', 'description', 'cta'];
        for (const elem of elements) {
          const { data } = await supabase
            .from('text_content')
            .select('content, color_token, button_url, button_bg_color')
            .eq('element_id', `${elementIdPrefix}-${elem}`)
            .maybeSingle();
          
          if (data) {
            switch(elem) {
              case 'number':
                if (data.content) setNumber(data.content);
                if (data.color_token) setNumberColor(data.color_token);
                break;
              case 'title':
                if (data.content) setTitle(data.content);
                if (data.color_token) setTitleColor(data.color_token);
                break;
              case 'description':
                if (data.content) setDescription(data.content);
                if (data.color_token) setDescriptionColor(data.color_token);
                break;
              case 'cta':
                if (data.content) setCtaText(data.content);
                if (data.color_token) setCtaTextColor(data.color_token);
                if (data.button_url) setCtaUrl(data.button_url);
                if (data.button_bg_color) setCtaBgColor(data.button_bg_color);
                break;
            }
          }
        }

        // Load card layout settings
        const { data: layoutData } = await supabase
          .from('image_carousel_settings')
          .select('card_height, card_width, card_border_radius, card_gap')
          .eq('location_id', elementIdPrefix)
          .maybeSingle();

        if (layoutData) {
          setCardHeight(layoutData.card_height || 'h-[500px]');
          setCardWidth(layoutData.card_width || 'w-full');
          setCardBorderRadius(layoutData.card_border_radius || 'rounded-2xl');
          setCardGap(layoutData.card_gap || 'gap-8');
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSavedData();
  }, [isOpen, elementIdPrefix]);

  // Load color system from database
  const {
    SOLID_COLORS,
    GRADIENT_COLORS,
    GLASS_EFFECTS,
    TEXT_COLOR_OPTIONS,
    ALL_BACKGROUND_OPTIONS,
    loading: colorSystemLoading,
  } = useColorSystem();

  const colorOptions = getColorTokenOptions();

  // State for accessibility scores
  const [accessibilityScores, setAccessibilityScores] = useState<any[]>([]);

  const calculateAccessibilityScores = () => {
    const scores = [];
    
    // Require at least some content to calculate
    if (!number && !title && !description && !ctaText) {
      return scores;
    }
    
    try {
      // Get background color - handle multiple sources
      let bgValue = '';
      if (background.includes('gradient') || background.includes('glass')) {
        // For gradients/glass, use card color
        bgValue = getComputedStyle(document.documentElement)
          .getPropertyValue('--card').trim();
      } else if (background.includes('bg-')) {
        // Extract color from bg- class
        const colorKey = background.replace('bg-', '').split('/')[0];
        bgValue = getComputedStyle(document.documentElement)
          .getPropertyValue(`--${colorKey}`).trim();
      }
      
      if (!bgValue) {
        bgValue = getComputedStyle(document.documentElement)
          .getPropertyValue('--card').trim();
      }
      
      // Only calculate if we have a valid background
      if (!bgValue) {
        console.warn('Could not determine background color for accessibility calculation');
        return scores;
      }
      
      // Number vs Background
      if (number) {
        const numValue = getComputedStyle(document.documentElement)
          .getPropertyValue(`--${normalizeColorToken(numberColor)}`).trim();
        if (numValue) {
          const ratio = calculateContrastRatio(`hsl(${bgValue})`, `hsl(${numValue})`);
          scores.push({
            label: 'Card Number',
            ratio,
            level: getContrastLevel(ratio),
            pass: ratio >= 4.5,
          });
        }
      }

      // Title vs Background
      if (title) {
        const titleValue = getComputedStyle(document.documentElement)
          .getPropertyValue(`--${normalizeColorToken(titleColor)}`).trim();
        if (titleValue) {
          const ratio = calculateContrastRatio(`hsl(${bgValue})`, `hsl(${titleValue})`);
          scores.push({
            label: 'Title Text',
            ratio,
            level: getContrastLevel(ratio),
            pass: ratio >= 4.5,
          });
        }
      }

      // Description vs Background
      if (description) {
        const descValue = getComputedStyle(document.documentElement)
          .getPropertyValue(`--${normalizeColorToken(descriptionColor)}`).trim();
        if (descValue) {
          const ratio = calculateContrastRatio(`hsl(${bgValue})`, `hsl(${descValue})`);
          scores.push({
            label: 'Description Text',
            ratio,
            level: getContrastLevel(ratio),
            pass: ratio >= 4.5,
          });
        }
      }

      // CTA Button contrast
      if (ctaText) {
        const ctaBgValue = getComputedStyle(document.documentElement)
          .getPropertyValue(`--${normalizeColorToken(ctaBgColor)}`).trim();
        const ctaTxtValue = getComputedStyle(document.documentElement)
          .getPropertyValue(`--${normalizeColorToken(ctaTextColor)}`).trim();
        if (ctaBgValue && ctaTxtValue) {
          const ratio = calculateContrastRatio(`hsl(${ctaBgValue})`, `hsl(${ctaTxtValue})`);
          scores.push({
            label: 'Button Text',
            ratio,
            level: getContrastLevel(ratio),
            pass: ratio >= 4.5,
          });
        }
      }
    } catch (error) {
      console.error('Error calculating accessibility scores:', error);
    }

    return scores;
  };

  // Recalculate accessibility when content or colors change
  useEffect(() => {
    const scores = calculateAccessibilityScores();
    setAccessibilityScores(scores);
  }, [background, number, numberColor, title, titleColor, description, descriptionColor, ctaText, ctaBgColor, ctaTextColor]);

  // Helper to strip color prefixes for comparison (renamed to avoid shadowing imported normalizeColorToken)
  const stripColorPrefix = (token: string) => {
    return token.replace('text-', '').replace('--', '').trim();
  };

  const isColorSelected = (colorValue: string, currentValue: string) => {
    const normalized1 = stripColorPrefix(colorValue);
    const normalized2 = stripColorPrefix(currentValue);
    
    // Exact match only - no fuzzy mapping
    return normalized1 === normalized2;
  };

  // Use centralized utility for background preview styles
  const previewBackgroundStyle = getBackgroundStyleFromToken(background);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        { element_id: `${elementIdPrefix}-background`, background_class: background },
        { element_id: `${elementIdPrefix}-icon-card`, background_class: iconCardBg },
        { element_id: `${elementIdPrefix}-image-container`, background_class: imageContainerBg },
        { element_id: `${elementIdPrefix}-number`, content: number, color_token: numberColor },
        { element_id: `${elementIdPrefix}-title`, content: title, color_token: titleColor },
        { element_id: `${elementIdPrefix}-description`, content: description, color_token: descriptionColor },
        { element_id: `${elementIdPrefix}-cta`, content: ctaText, color_token: ctaTextColor, button_url: ctaUrl, button_bg_color: ctaBgColor },
      ];

      // Save icon styles (color and size) to icon_styles table
      const { data: existingIconStyle } = await supabase
        .from('icon_styles')
        .select('id')
        .eq('element_id', `${elementIdPrefix}-icon`)
        .maybeSingle();

      if (existingIconStyle) {
        await supabase
          .from('icon_styles')
          .update({ 
            icon_color_token: iconColor,
            size: iconSize,
            updated_at: new Date().toISOString()
          })
          .eq('element_id', `${elementIdPrefix}-icon`);
      } else {
        await supabase
          .from('icon_styles')
          .insert([{
            element_id: `${elementIdPrefix}-icon`,
            icon_color_token: iconColor,
            size: iconSize,
            background_token: 'bg-transparent',
          }]);
      }

      // Save backgrounds (main, icon card, and image container)
      for (const bgUpdate of updates.slice(0, 3)) {
        // @ts-ignore
        const { data: existingBg } = await supabase
          .from('background_styles')
          .select('id')
          .eq('element_id', bgUpdate.element_id)
          .maybeSingle();

        // For main background, also save text_color_class and shadow_class
        const isMainBackground = bgUpdate.element_id === `${elementIdPrefix}-background`;
        const textColorForBg = isMainBackground ? titleColor : undefined;
        const shadowForBg = isMainBackground ? cardShadow : undefined;

        if (existingBg) {
          // @ts-ignore
          await supabase
            .from('background_styles')
            .update({ 
              background_class: bgUpdate.background_class,
              ...(textColorForBg && { text_color_class: textColorForBg }),
              ...(shadowForBg && { shadow_class: shadowForBg }),
            })
            .eq('element_id', bgUpdate.element_id);
        } else {
          // @ts-ignore
          await supabase
            .from('background_styles')
            .insert([{
              element_id: bgUpdate.element_id,
              background_class: bgUpdate.background_class,
              ...(textColorForBg && { text_color_class: textColorForBg }),
              ...(shadowForBg && { shadow_class: shadowForBg }),
            }]);
        }
      }

      // Save text elements
      for (const update of updates.slice(3)) {
        // @ts-ignore
        const { data: existing } = await supabase
          .from('text_content')
          .select('id')
          .eq('element_id', update.element_id)
          .maybeSingle();

        if (existing) {
          // @ts-ignore
          await supabase
            .from('text_content')
            .update({ 
              content: update.content, 
              color_token: update.color_token,
              button_url: update.button_url,
              button_bg_color: update.button_bg_color
            })
            .eq('element_id', update.element_id);
        } else {
          // @ts-ignore
          await supabase
            .from('text_content')
            .insert([{
              element_id: update.element_id,
              content: update.content,
              color_token: update.color_token,
              button_url: update.button_url,
              button_bg_color: update.button_bg_color,
              element_type: 'text',
              page_location: 'unknown',
              section: 'unknown',
            }]);
        }
      }

      toast.success('All changes saved successfully');
      onSave?.({
        background,
        iconCardBg,
        imageContainerBg,
        number,
        numberColor,
        title,
        titleColor,
        description,
        descriptionColor,
        ctaText,
        ctaUrl,
        ctaBgColor,
        ctaTextColor,
        iconColor,
        iconSize,
        cardHeight,
        cardWidth,
        cardBorderRadius,
        cardGap,
        cardShadow,
      });

      // Save card layout settings
      const { error: layoutError } = await supabase
        .from('image_carousel_settings')
        .upsert({
          location_id: elementIdPrefix,
          card_height: cardHeight,
          card_width: cardWidth,
          card_border_radius: cardBorderRadius,
          card_gap: cardGap,
          display_type: 'image',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'location_id'
        });

      if (layoutError) console.error('Layout save error:', layoutError);

      onClose();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const hasIssues = accessibilityScores.some(s => !s.pass);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Component Styles</DialogTitle>
          <DialogDescription>
            Customize all aspects of this component including background, text, and colors
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Loading saved styles...</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Live Preview</label>
            <div 
              className="p-6 rounded-xl border"
              style={previewBackgroundStyle}
            >
              {/* Icon card preview */}
              {iconCardBg && (
                <div className={cn('p-2.5 rounded-lg backdrop-blur-sm mb-4 inline-block', iconCardBg)}>
                  <ImageIcon 
                    className={cn(
                      iconSize === 'small' && 'w-4 h-4',
                      iconSize === 'default' && 'w-6 h-6',
                      iconSize === 'medium' && 'w-8 h-8',
                      iconSize === 'large' && 'w-12 h-12',
                      iconSize === 'xl' && 'w-16 h-16',
                      !['small', 'default', 'medium', 'large', 'xl'].includes(iconSize) && 'w-6 h-6'
                    )}
                    style={{ color: resolveTextColor(iconColor) }}
                  />
                </div>
              )}
              
              {number && (
                <div className="mb-4">
                  <span 
                    className="text-2xl font-bold"
                    style={{ color: resolveTextColor(numberColor) }}
                  >
                    {number}
                  </span>
                </div>
              )}
              {title && (
                <h3 
                  className="text-xl font-bold mb-2"
                  style={{ color: resolveTextColor(titleColor) }}
                >
                  {title}
                </h3>
              )}
              {description && (
                <p 
                  className="mb-4"
                  style={{ color: resolveTextColor(descriptionColor) }}
                >
                  {description}
                </p>
              )}
              {ctaText && (
                <button 
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{
                    backgroundColor: `hsl(var(--${stripColorPrefix(ctaBgColor)}))`,
                    color: resolveTextColor(ctaTextColor)
                  }}
                >
                  {ctaText}
                </button>
              )}
            </div>

            {/* Accessibility Report */}
            <div className="space-y-2 mt-4">
              <label className="text-sm font-medium">Accessibility Report</label>
              <div className="border rounded-lg p-4 space-y-2">
                {accessibilityScores.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Add content to see accessibility scores</p>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      {hasIssues ? (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                      <span className="font-medium">
                        {hasIssues ? 'Some Issues Found' : 'All Checks Passed'}
                      </span>
                    </div>
                    {accessibilityScores.map((score, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span>{score.label}</span>
                        <span className={score.pass ? 'text-green-400' : 'text-red-400'}>
                          {score.ratio.toFixed(1)}:1 ({score.level})
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Edit Tabs */}
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="background">
                <Palette className="w-4 h-4 mr-1" />
                Background
              </TabsTrigger>
              <TabsTrigger value="text">
                <Type className="w-4 h-4 mr-1" />
                Text
              </TabsTrigger>
              <TabsTrigger value="cta">
                <MousePointer className="w-4 h-4 mr-1" />
                CTA
              </TabsTrigger>
              <TabsTrigger value="layout">
                <Settings className="w-4 h-4 mr-1" />
                Layout
              </TabsTrigger>
            </TabsList>

              <TabsContent value="background" className="space-y-6">
                {colorSystemLoading ? (
                  <p className="text-sm text-muted-foreground">Loading color options...</p>
                ) : (
                  <>
                    {/* Style Presets */}
                    <CardStylePresetPicker
                      onApply={(preset) => {
                        setBackground(preset.background_class);
                        setTitleColor(preset.text_color_class);
                        setDescriptionColor(preset.text_color_class);
                        setNumberColor(preset.text_color_class);
                        if (preset.shadow_class) setCardShadow(preset.shadow_class);
                        if (preset.icon_color_token) setIconColor(preset.icon_color_token);
                      }}
                      currentBackground={background}
                      currentTextColor={titleColor}
                      currentShadow={cardShadow}
                    />
                    
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Main Card Background</label>
                      <Tabs defaultValue="gradients" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="gradients">Gradients ({GRADIENT_COLORS.length})</TabsTrigger>
                          <TabsTrigger value="glass">Glass ({GLASS_EFFECTS.length})</TabsTrigger>
                          <TabsTrigger value="solids">Solids ({SOLID_COLORS.length})</TabsTrigger>
                        </TabsList>

                    <TabsContent value="gradients" className="mt-4">
                      <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                        {GRADIENT_COLORS.map((bg) => (
                          <Card
                            key={bg.value}
                            className={cn(
                              'p-3 cursor-pointer transition-all hover:shadow-md',
                              background === bg.value ? 'ring-2 ring-primary shadow-lg' : 'hover:ring-1 hover:ring-border'
                            )}
                            onClick={() => setBackground(bg.value)}
                          >
                            <div 
                              className="h-20 rounded-lg mb-2 relative flex items-center justify-center"
                              style={{
                                ...(bg.type === 'gradient' && bg.cssVar
                                  ? { backgroundImage: `var(${bg.cssVar})` }
                                  : {}),
                              }}
                            >
                              {background === bg.value && (
                                <Check className="absolute top-1 right-1 w-5 h-5 text-white bg-primary rounded-full p-0.5" />
                              )}
                              <span className="text-xs font-medium text-white opacity-70">Preview</span>
                            </div>
                            <h4 className="font-semibold text-xs truncate">{bg.label}</h4>
                            <p className="text-xs text-muted-foreground truncate">{bg.description}</p>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="glass" className="mt-4">
                      <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                        {GLASS_EFFECTS.map((bg) => (
                          <Card
                            key={bg.value}
                            className={cn(
                              'p-3 cursor-pointer transition-all hover:shadow-md',
                              background === bg.value ? 'ring-2 ring-primary shadow-lg' : 'hover:ring-1 hover:ring-border'
                            )}
                            onClick={() => setBackground(bg.value)}
                          >
                            <div className="relative h-20 rounded-lg mb-2 overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-hero" />
                              <div 
                                className="absolute inset-0 flex items-center justify-center"
                                style={{
                                  ...(bg.type === 'glass' && bg.cssVar
                                    ? { backgroundImage: `var(${bg.cssVar})` }
                                    : {}),
                                }}
                              >
                                {background === bg.value && (
                                  <Check className="absolute top-1 right-1 w-5 h-5 text-white bg-primary rounded-full p-0.5" />
                                )}
                                <span className="text-xs font-medium text-white opacity-70">Glass</span>
                              </div>
                            </div>
                            <h4 className="font-semibold text-xs truncate">{bg.label}</h4>
                            <p className="text-xs text-muted-foreground truncate">{bg.description}</p>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="solids" className="mt-4">
                      <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                        {SOLID_COLORS.map((bg) => (
                          <Card
                            key={bg.value}
                            className={cn(
                              'p-3 cursor-pointer transition-all hover:shadow-md',
                              background === bg.value ? 'ring-2 ring-primary shadow-lg' : 'hover:ring-1 hover:ring-border'
                            )}
                            onClick={() => setBackground(bg.value)}
                          >
                            <div 
                              className="h-20 rounded-lg mb-2 relative flex items-center justify-center border"
                              style={{
                                ...(bg.type === 'solid' && bg.hslValue
                                  ? { backgroundColor: `hsl(${bg.hslValue})` }
                                  : {}),
                              }}
                            >
                              {background === bg.value && (
                                <Check className="absolute top-1 right-1 w-5 h-5 text-primary bg-white rounded-full p-0.5" />
                              )}
                              <span className={cn('text-xs font-medium', bg.optimalTextColor === 'white' ? 'text-white' : 'text-foreground')}>
                                Solid
                              </span>
                            </div>
                            <h4 className="font-semibold text-xs truncate">{bg.label}</h4>
                            <p className="text-xs text-muted-foreground truncate">{bg.description}</p>
                          </Card>
                        ))}
                      </div>
                        </TabsContent>
                      </Tabs>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium">Inner Card Background (Icon Area)</label>
                      <p className="text-xs text-muted-foreground">Controls the background of the card containing icons/images</p>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { value: 'bg-white/10', label: 'White/10' },
                          { value: 'bg-white/20', label: 'White/20' },
                          { value: 'bg-card', label: 'Card' },
                          { value: 'bg-background', label: 'Background' },
                          { value: 'bg-muted', label: 'Muted' },
                          { value: 'bg-primary/10', label: 'Primary/10' },
                          { value: 'bg-white', label: 'White' },
                          { value: 'bg-transparent', label: 'Transparent' },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            className={cn(
                              'h-16 rounded-lg border-2 transition-all hover:scale-105 relative overflow-hidden',
                              iconCardBg === opt.value 
                                ? 'border-primary ring-2 ring-primary/20' 
                                : 'border-border hover:border-primary/50'
                            )}
                            onClick={() => setIconCardBg(opt.value)}
                          >
                            <div className={cn('absolute inset-0', opt.value)} />
                            {iconCardBg === opt.value && (
                              <Check className="absolute top-1 right-1 w-4 h-4 text-primary bg-white rounded-full p-0.5" />
                            )}
                            <span className="absolute bottom-1 left-1 text-[10px] font-medium text-foreground bg-white/90 px-1.5 py-0.5 rounded">
                              {opt.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Image Container Background
                      </label>
                      <p className="text-xs text-muted-foreground">Background color/effect behind carousel or single image</p>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { value: 'bg-transparent', label: 'None' },
                          { value: 'bg-white/5', label: 'White/5' },
                          { value: 'bg-white/10', label: 'White/10' },
                          { value: 'bg-black/5', label: 'Black/5' },
                          { value: 'bg-gradient-to-br from-background/95 to-background/80', label: 'Gradient' },
                          { value: 'bg-gradient-to-br from-purple-500/10 to-blue-500/10', label: 'Purple/Blue' },
                          { value: 'bg-card', label: 'Card' },
                          { value: 'bg-muted', label: 'Muted' },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            className={cn(
                              'h-16 rounded-lg border-2 transition-all hover:scale-105 relative overflow-hidden',
                              imageContainerBg === opt.value 
                                ? 'border-primary ring-2 ring-primary/20' 
                                : 'border-border hover:border-primary/50'
                            )}
                            onClick={() => setImageContainerBg(opt.value)}
                          >
                            <div className={cn('absolute inset-0', opt.value)} />
                            {imageContainerBg === opt.value && (
                              <Check className="absolute top-1 right-1 w-4 h-4 text-primary bg-white rounded-full p-0.5" />
                            )}
                            <span className="absolute bottom-1 left-1 text-[10px] font-medium text-foreground bg-white/90 px-1.5 py-0.5 rounded">
                              {opt.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="text" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Card Number</label>
                  <Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="01" />
                  <label className="text-sm font-medium mt-2">Number Color</label>
                  <div className="grid grid-cols-4 gap-2">
                    {TEXT_COLOR_OPTIONS.map((colorOption) => (
                      <button
                        key={colorOption.value}
                        onClick={() => setNumberColor(colorOption.value.replace('text-', ''))}
                        className={cn(
                          'p-3 rounded-lg border-2 transition-all hover:scale-105 bg-primary/90 relative',
                          isColorSelected(colorOption.value, numberColor)
                            ? 'border-white ring-2 ring-white/50'
                            : 'border-transparent hover:border-white/30'
                        )}
                        title={colorOption.description}
                      >
                        {isColorSelected(colorOption.value, numberColor) && (
                          <Check className="absolute top-1 right-1 w-4 h-4 text-primary bg-white rounded-full p-0.5" />
                        )}
                        <div 
                          className="text-center font-bold text-xl"
                          style={{ color: resolveTextColor(colorOption.value.replace('text-', '')) }}
                        >
                          Aa
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon Color Section */}
                <div className="space-y-2 border-b pb-4 mb-4">
                  <label className="text-sm font-medium">Icon Color</label>
                  <div className="grid grid-cols-4 gap-2">
                    {TEXT_COLOR_OPTIONS.map((colorOption) => (
                      <button
                        key={`icon-${colorOption.value}`}
                        onClick={() => setIconColor(colorOption.value.replace('text-', ''))}
                        className={cn(
                          'p-3 rounded-lg border-2 transition-all hover:scale-105 bg-primary/90 relative',
                          isColorSelected(colorOption.value, iconColor)
                            ? 'border-white ring-2 ring-white/50'
                            : 'border-transparent hover:border-white/30'
                        )}
                        title={colorOption.description}
                      >
                        {isColorSelected(colorOption.value, iconColor) && (
                          <Check className="absolute top-1 right-1 w-4 h-4 text-primary bg-white rounded-full p-0.5" />
                        )}
                        <div className="text-center">
                          <Settings 
                            className="w-6 h-6 mx-auto" 
                            style={{ color: resolveTextColor(colorOption.value.replace('text-', '')) }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Icon Size Section */}
                <div className="space-y-2 border-b pb-4 mb-4">
                  <label className="text-sm font-medium">Icon Size</label>
                  <Select value={iconSize} onValueChange={setIconSize}>
                    <SelectTrigger className="bg-background text-foreground border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="small">Small (16px)</SelectItem>
                      <SelectItem value="default">Default (24px)</SelectItem>
                      <SelectItem value="medium">Medium (32px)</SelectItem>
                      <SelectItem value="large">Large (48px)</SelectItem>
                      <SelectItem value="xl">X-Large (64px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Card Title" />
                  <label className="text-sm font-medium mt-2">Title Color</label>
                  <div className="grid grid-cols-4 gap-2">
                    {TEXT_COLOR_OPTIONS.map((colorOption) => (
                      <button
                        key={colorOption.value}
                        onClick={() => setTitleColor(colorOption.value.replace('text-', ''))}
                        className={cn(
                          'p-3 rounded-lg border-2 transition-all hover:scale-105 bg-primary/90 relative',
                          isColorSelected(colorOption.value, titleColor)
                            ? 'border-white ring-2 ring-white/50'
                            : 'border-transparent hover:border-white/30'
                        )}
                        title={colorOption.description}
                      >
                        {isColorSelected(colorOption.value, titleColor) && (
                          <Check className="absolute top-1 right-1 w-4 h-4 text-primary bg-white rounded-full p-0.5" />
                        )}
                        <div 
                          className="text-center font-bold text-xl"
                          style={{ color: resolveTextColor(colorOption.value.replace('text-', '')) }}
                        >
                          Aa
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Description text..." 
                  />
                  <label className="text-sm font-medium mt-2">Description Color</label>
                  <div className="grid grid-cols-4 gap-2">
                    {TEXT_COLOR_OPTIONS.map((colorOption) => (
                      <button
                        key={colorOption.value}
                        onClick={() => setDescriptionColor(colorOption.value.replace('text-', ''))}
                        className={cn(
                          'p-3 rounded-lg border-2 transition-all hover:scale-105 bg-primary/90 relative',
                          isColorSelected(colorOption.value, descriptionColor)
                            ? 'border-white ring-2 ring-white/50'
                            : 'border-transparent hover:border-white/30'
                        )}
                        title={colorOption.description}
                      >
                        {isColorSelected(colorOption.value, descriptionColor) && (
                          <Check className="absolute top-1 right-1 w-4 h-4 text-primary bg-white rounded-full p-0.5" />
                        )}
                        <div 
                          className="text-center font-bold text-xl"
                          style={{ color: resolveTextColor(colorOption.value.replace('text-', '')) }}
                        >
                          Aa
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="cta" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Button Text</label>
                  <Input value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Learn More" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Button URL</label>
                  <Input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="/demo" />
                  <div className="flex flex-wrap gap-2 mt-2">
                    <p className="text-xs text-muted-foreground w-full">Quick links:</p>
                    {['/demo', '/contact', '/functions', '/architecture', '/pricing', '/solutions'].map((path) => (
                      <Button
                        key={path}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => setCtaUrl(path)}
                      >
                        {path}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Button Background Color</label>
                  <Select value={ctaBgColor} onValueChange={setCtaBgColor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_BACKGROUND_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded border" 
                              style={
                                option.type === 'gradient' || option.type === 'glass'
                                  ? { backgroundImage: `var(${option.cssVar})` }
                                  : { backgroundColor: `hsl(${option.hslValue})` }
                              }
                            />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Button Text Color</label>
                  <Select value={ctaTextColor} onValueChange={setCtaTextColor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEXT_COLOR_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded border" 
                              style={{ backgroundColor: `hsl(${option.hslValue})` }}
                            />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="layout" className="space-y-4">
                <UnifiedStyleModalLayoutTab
                  cardHeight={cardHeight}
                  setCardHeight={setCardHeight}
                  cardWidth={cardWidth}
                  setCardWidth={setCardWidth}
                  cardBorderRadius={cardBorderRadius}
                  setCardBorderRadius={setCardBorderRadius}
                  cardGap={cardGap}
                  setCardGap={setCardGap}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
