export interface FileData {
  main_image: File;
  thumbnail1: File;
  thumbnail2: File;
  thumbnail3: File;
  thumbnail4: File;
  thumbnail5: File;
  fields: {
    sku: string;
    name: string;
    description: string;
    category: string;
    status: "Archived" | "Active" | "Draft";
    price: number;
    discount: number;
    quantity: number;
  };
}

export interface ProductData {
  main_image: File;
  thumbnail1: File;
  thumbnail2: File;
  thumbnail3: File;
  thumbnail4: File;
  thumbnail5: File;
  fields: {
    id: number;
    sku: string;
    name: string;
    description: string;
    product_status_id: number;
    price: number;
    discount_percentage: number;
    category: string;
    status: "Archived" | "Active" | "Draft";
    discount: number;
    quantity: number;
    taxable: boolean;
    tags: string;
    CPU?: string;
    RAM?: string;
    Storage?: string;
    Ports?: string;
    Webcam?: string;
    Connectivity?: string;
    Processor?: string;
    OperatingSystem?: string;
    Weight?: string;
    ScreenSize?: string;
    CameraResolution?: string;
    BatteryLife?: string;
    PrintSpeed?: string;
    WiFi?: string;
    Copying?: string;
    Scanning?: string;
    PaperHandling?: string;
    Consumables?: string;
    PrinterSoftware?: string;
    NetworkProtocol?: string;
    Interface?: string;
    NetworkCompatibility?: string;
    SIMCardSlot?: string;
    WirelessConnectivity?: string;
    MaxDevicesConnected?: string;
    Battery?: string;
    Security?: string;
    Display?: string;
    AccessControl?: string;
    Compatibility?: string;
    ViewableImageArea?: string;
    AspectRatio?: string;
    Contrast?: string;
    Resolution?: string;
    Cores?: string;
    ProcessorFrequency?: string;
    Memory?: string;
    Graphics?: string;
    PowerSupply?: string;
    Dimensions?: string;
  };
}
export interface UploadFormProps {
  initialData?: any;
  onSubmit: (data: FormData) => Promise<void>;
  isEdit: any;
  productData: any;
}

export interface ProductssData {
  id: number;
  sku: string;
  price: number;
  discount: number;
  quantity: number;
  status: string;
  category: string;
  name: string;
  description: string;
  images: {
    main: string; // Base64 string of main image
    thumbnails: string[]; // Array of Base64 strings of thumbnails
  };
}
export interface ImageData {
  id: string;
  main_image: string;
  thumbnail1: string;
  thumbnail2: string;
  thumbnail3: string;
  thumbnail4: string;
  thumbnail5: string;
  productName: string;
  productDescription: string;
  price: number;
  discount: number;
  quantity: number;
}
export interface CategoryData {
  id: string;
  name: string;
}
