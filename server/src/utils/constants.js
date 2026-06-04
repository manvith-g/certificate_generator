export const ALLOWED_TEMPLATE_TYPES = ['.png', '.jpg', '.jpeg', '.pdf'];
export const ALLOWED_CSV_TYPES = ['.csv', '.xlsx', '.xls'];
export const MAX_TEMPLATE_SIZE = 20 * 1024 * 1024; // 20MB
export const MAX_CSV_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_BATCH_SIZE = 1000;

export const DEFAULT_FIELD_PROPS = {
  font_family: 'Inter',
  font_size: 32,
  font_color: '#000000',
  font_weight: 'normal',
  font_style: 'normal',
  text_align: 'center',
  letter_spacing: 0,
  rotation: 0,
  scale_x: 1,
  scale_y: 1,
  z_index: 0,
};

export const AVAILABLE_FONTS = [
  { name: 'Inter', file: 'Inter-Regular.ttf', bold: 'Inter-Bold.ttf', italic: 'Inter-Italic.ttf' },
  { name: 'Roboto', file: 'Roboto-Regular.ttf', bold: 'Roboto-Bold.ttf', italic: 'Roboto-Italic.ttf' },
  { name: 'Poppins', file: 'Poppins-Regular.ttf', bold: 'Poppins-Bold.ttf', italic: 'Poppins-Italic.ttf' },
  { name: 'Playfair Display', file: 'PlayfairDisplay-Regular.ttf', bold: 'PlayfairDisplay-Bold.ttf', italic: 'PlayfairDisplay-Italic.ttf' },
  { name: 'Montserrat', file: 'Montserrat-Regular.ttf', bold: 'Montserrat-Bold.ttf', italic: 'Montserrat-Italic.ttf' },
  { name: 'Open Sans', file: 'OpenSans-Regular.ttf', bold: 'OpenSans-Bold.ttf', italic: 'OpenSans-Italic.ttf' },
  { name: 'Lato', file: 'Lato-Regular.ttf', bold: 'Lato-Bold.ttf', italic: 'Lato-Italic.ttf' },
  { name: 'Great Vibes', file: 'GreatVibes-Regular.ttf', bold: null, italic: null },
  { name: 'Dancing Script', file: 'DancingScript-Regular.ttf', bold: 'DancingScript-Bold.ttf', italic: null },
  { name: 'Arial', file: null, bold: null, italic: null }, // System font fallback
];

export const PREDEFINED_FIELDS = [
  { name: 'Name', key: 'Name' },
  { name: 'Date', key: 'Date' },
  { name: 'Event Name', key: 'EventName' },
  { name: 'Certificate ID', key: 'CertificateID' },
  { name: 'College Name', key: 'College' },
  { name: 'Position/Rank', key: 'Position' },
];
