// Typography design system constants
// This file defines the typography scale used throughout the application

export const TYPOGRAPHY_SCALE = {
  headings: [
    { 
      tag: "h1", 
      class: "text-6xl font-bold", 
      sample: "Display Heading", 
      description: "Hero titles, main page headers" 
    },
    { 
      tag: "h2", 
      class: "text-4xl font-bold", 
      sample: "Section Heading", 
      description: "Major section titles" 
    },
    { 
      tag: "h3", 
      class: "text-2xl font-semibold", 
      sample: "Subsection Heading", 
      description: "Subsection titles" 
    },
    { 
      tag: "h4", 
      class: "text-xl font-semibold", 
      sample: "Component Heading", 
      description: "Component or card titles" 
    },
    { 
      tag: "h5", 
      class: "text-lg font-medium", 
      sample: "Small Heading", 
      description: "Minor section headings" 
    },
    { 
      tag: "h6", 
      class: "text-base font-medium", 
      sample: "Tiny Heading", 
      description: "Labels and small titles" 
    },
  ],
  
  bodyText: [
    { 
      name: "Large Body", 
      class: "text-xl", 
      sample: "This is large body text for important content and introductions." 
    },
    { 
      name: "Regular Body", 
      class: "text-base", 
      sample: "This is regular body text for most content, paragraphs, and descriptions." 
    },
    { 
      name: "Small Body", 
      class: "text-sm", 
      sample: "This is small body text for captions, metadata, and secondary information." 
    },
    { 
      name: "Extra Small", 
      class: "text-xs", 
      sample: "This is extra small text for fine print and minimal details." 
    },
  ],

  weights: [
    { name: "Light", class: "font-light", weight: "300" },
    { name: "Regular", class: "font-normal", weight: "400" },
    { name: "Medium", class: "font-medium", weight: "500" },
    { name: "Semibold", class: "font-semibold", weight: "600" },
    { name: "Bold", class: "font-bold", weight: "700" },
    { name: "Black", class: "font-black", weight: "900" },
  ],

  specialStyles: [
    { 
      name: "Gradient Text", 
      class: "gradient-text text-4xl font-bold", 
      sample: "Gradient Heading" 
    },
    { 
      name: "Muted Text", 
      class: "text-muted-foreground", 
      sample: "Secondary text content" 
    },
    { 
      name: "Code Text", 
      class: "font-mono text-sm bg-muted px-2 py-1 rounded", 
      sample: "const variable = 'value'" 
    },
    { 
      name: "Link Text", 
      class: "text-primary hover:underline", 
      sample: "Interactive link text" 
    },
  ]
} as const;

// Helper function to get typography class by element type
export const getTypographyClass = (elementType: string): string => {
  switch (elementType) {
    case 'h1':
      return TYPOGRAPHY_SCALE.headings[0].class;
    case 'h2':
      return TYPOGRAPHY_SCALE.headings[1].class;
    case 'h3':
      return TYPOGRAPHY_SCALE.headings[2].class;
    case 'h4':
      return TYPOGRAPHY_SCALE.headings[3].class;
    case 'h5':
      return TYPOGRAPHY_SCALE.headings[4].class;
    case 'h6':
      return TYPOGRAPHY_SCALE.headings[5].class;
    case 'subtitle':
      return TYPOGRAPHY_SCALE.bodyText[0].class; // Large Body
    case 'description':
      return TYPOGRAPHY_SCALE.bodyText[1].class; // Regular Body
    default:
      return TYPOGRAPHY_SCALE.bodyText[1].class; // Regular Body as fallback
  }
};

// Helper function to get full class string including gradient for h1
export const getTypographyClassWithSpecialStyles = (elementType: string): string => {
  const baseClass = getTypographyClass(elementType);
  
  if (elementType === 'h1') {
    return `${baseClass} gradient-text`;
  }
  
  if (elementType === 'subtitle' || elementType === 'description') {
    return `${baseClass} text-muted-foreground`;
  }
  
  return `${baseClass} text-foreground`;
};