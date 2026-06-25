"use client"

import React from "react"
import { Users, User, ChevronDown } from "lucide-react"

export default function StructureVisualTree() {
  return (
    <div className="h-[500px] w-full bg-card rounded-2xl overflow-auto p-8 flex justify-center">
      <div className="flex flex-col items-center space-y-8 min-w-max">
        
        {/* CEO / Head */}
        <div className="flex flex-col items-center group cursor-pointer">
          <div className="w-64 bg-card border border-primary/30 rounded-xl p-4 shadow-sm group-hover:border-primary transition-all relative z-10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
              CEO
            </div>
            <div className="flex items-center gap-3">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" className="w-10 h-10 rounded-full object-cover ring-2 ring-border shadow-sm" alt="" />
              <div>
                <p className="font-bold text-sm text-foreground">Sarah Jenkins</p>
                <p className="text-xs text-muted-foreground">Chief Executive Officer</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users size={12}/> 142 Direct/Indirect</span>
            </div>
          </div>
          <div className="w-px h-8 bg-border/80"></div>
          <div className="w-[600px] h-px bg-border/80"></div>
          
          <div className="flex justify-between w-[600px] mt-0">
            {/* Engineering */}
            <div className="flex flex-col items-center">
              <div className="w-px h-8 bg-border/80"></div>
              <div className="w-56 bg-card border border-border/50 rounded-xl p-4 shadow-sm hover:border-border transition-all relative z-10">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-accent text-muted-foreground text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Engineering
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm ring-2 ring-border shadow-sm">
                    MK
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">Michael K.</p>
                    <p className="text-xs text-muted-foreground">VP of Engineering</p>
                  </div>
                </div>
              </div>
              
              <div className="w-px h-8 bg-border/80"></div>
              <div className="w-48 h-px bg-border/80"></div>
              <div className="flex justify-between w-48 mt-0">
                <div className="flex flex-col items-center">
                  <div className="w-px h-6 bg-border/80"></div>
                  <div className="w-40 bg-card border border-border/50 rounded-lg p-3 shadow-sm hover:border-border">
                    <p className="font-bold text-xs text-foreground text-center">Frontend Team</p>
                    <p className="text-[10px] text-muted-foreground text-center mt-0.5">8 members</p>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-px h-6 bg-border/80"></div>
                  <div className="w-40 bg-card border border-border/50 rounded-lg p-3 shadow-sm hover:border-border">
                    <p className="font-bold text-xs text-foreground text-center">Backend Team</p>
                    <p className="text-[10px] text-muted-foreground text-center mt-0.5">12 members</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Product */}
            <div className="flex flex-col items-center">
              <div className="w-px h-8 bg-border/80"></div>
              <div className="w-56 bg-card border border-border/50 rounded-xl p-4 shadow-sm hover:border-border transition-all relative z-10">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-accent text-muted-foreground text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Product
                </div>
                <div className="flex items-center gap-3">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" className="w-10 h-10 rounded-full object-cover ring-2 ring-border shadow-sm" alt="" />
                  <div>
                    <p className="font-bold text-sm text-foreground">Elena R.</p>
                    <p className="text-xs text-muted-foreground">Head of Product</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales */}
            <div className="flex flex-col items-center">
              <div className="w-px h-8 bg-border/80"></div>
              <div className="w-56 bg-card border border-border/50 rounded-xl p-4 shadow-sm hover:border-border transition-all relative z-10">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-accent text-muted-foreground text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Sales
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm ring-2 ring-border shadow-sm">
                    DJ
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">David J.</p>
                    <p className="text-xs text-muted-foreground">Sales Director</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
