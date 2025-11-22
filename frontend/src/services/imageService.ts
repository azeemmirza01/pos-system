// Image service for handling product images
class ImageService {
  async selectImage(): Promise<string | null> {
    if (window.electronAPI) {
      return await window.electronAPI.selectImage();
    }
    // Fallback for web (not implemented)
    return null;
  }

  async getImageUrl(filename: string | null | undefined): Promise<string | null> {
    if (!filename) return null;
    
    if (window.electronAPI) {
      return await window.electronAPI.getImagePath(filename);
    }
    
    // Fallback: if it's already a URL, return it
    if (filename.startsWith('http://') || filename.startsWith('https://') || 
        filename.startsWith('file://') || filename.startsWith('pos://')) {
      return filename;
    }
    
    return null;
  }

  async deleteImage(filename: string | null | undefined): Promise<void> {
    if (window.electronAPI && filename) {
      await window.electronAPI.deleteImage(filename);
    }
  }

  // Convert file to base64 for preview
  fileToBase64(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export default new ImageService();

