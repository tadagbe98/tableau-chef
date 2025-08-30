
'use client';
import { Minus, Square, X } from 'lucide-react';
import { Button } from './ui/button';
import { Logo } from './icons/logo';

export function CustomTitlebar() {
    
    // Functions to interact with Electron's main process
    const handleMinimize = () => {
        // @ts-ignore
        window.electronAPI?.minimizeWindow();
    };

    const handleMaximize = () => {
        // @ts-ignore
        window.electronAPI?.maximizeWindow();
    };

    const handleClose = () => {
        // @ts-ignore
        window.electronAPI?.closeWindow();
    };

    return (
        <div 
          className="h-8 bg-background/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b"
          style={{ '-webkit-app-region': 'drag' } as React.CSSProperties}
        >
            <div className="flex items-center gap-2 px-2">
                <Logo className="h-5 w-5 text-primary" />
                <span className="text-xs font-semibold">TableauChef</span>
            </div>
            
            <div className="flex items-center" style={{ '-webkit-app-region': 'no-drag' } as React.CSSProperties}>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={handleMinimize}>
                    <Minus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={handleMaximize}>
                    <Square className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-destructive" onClick={handleClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
