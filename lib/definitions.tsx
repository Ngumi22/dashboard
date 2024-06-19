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
    brand: string;
  };
}

export interface UploadFormProps {
  initialData?: any;
  onSubmit: (data: FormData) => Promise<void>;
  isEdit: boolean;
}

export interface ProductData {
  id: number;
  sku: string;
  price: number;
  discount: number;
  brand: string;
  quantity: number;
  status: string;
  category: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  images: {
    main: string; // Base64 string of main image
    thumbnails: string[]; // Array of Base64 strings of thumbnails
  };
}

export interface CategoryData {
  id: string;
  name: string;
}
