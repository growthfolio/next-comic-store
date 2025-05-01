import type React from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-muted/50">
      <div className="container py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {currentYear} ComicHub. All rights reserved.</p>
         {/* Optional: Add social links or other footer content here */}
         {/* <div className="flex justify-center gap-4 mt-2">
           <a href="#" className="hover:text-primary">Facebook</a>
           <a href="#" className="hover:text-primary">Twitter</a>
           <a href="#" className="hover:text-primary">Instagram</a>
         </div> */}
      </div>
    </footer>
  );
}
