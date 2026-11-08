# Implementation Guide: Targeted Mobile Fixes for KNOWBALL

> [!IMPORTANT]
> **Zero Visual Redesign — 100% Visual Preservation**  
> The visual aesthetic in your mobile screenshot is the approved, intended design (Cyber Neon / Stadium Scoreboard colors, authentic `SportRadarDial` compass in (0,0), 7-segment digital timer, and vector league medallions).  
> **Do NOT change any colors, fonts, icons, or component visual structures.**  
> Only apply the following 3 surgical CSS/layout adjustments.

---

## The 3 Surgical Changes Required

1. **Stop Mode Switcher Clipping (`Casual (4 Strikes)`):**
   * Reduce the mobile button padding and font from `px-2 text-[11px]` to `px-1.5 text-[10px]` on mobile.
   * This trims ~25px off the mode toggle, allowing the full text **`🔥 Ball Knower`** and **`Casual (4 Strikes)`** to fit comfortably beside the logo without touching or overflowing the right card edge.

2. **Left-Align the Action Toolbar (Row 3):**
   * Change `ml-auto sm:ml-0` on the action button container to `w-full sm:w-auto flex items-center justify-start gap-1.5`.
   * On mobile, the buttons (`[🎲] [🏳️] [🔊] [❓] [🏆 Stats] [🔄]`) will anchor to the **far left** of the card directly under the brand logo, eliminating the empty left-side gap.

3. **Guaranteed Text Fit Inside All 5×5 Grid Tiles (No Orphan Letters):**
   * In `src/components/Grid.tsx`, set category header text to `text-[7px] min-[390px]:text-[8px] sm:text-xs font-black uppercase tracking-tight sm:tracking-wider leading-[1.05] sm:leading-tight line-clamp-2 break-normal [word-break:keep-all] px-0.5`.
   * Hide the redundant `?` icon on mobile (`hidden sm:inline-block`) so text has 100% of the tile width.
   * `[word-break:keep-all]` explicitly prevents mid-word splitting, guaranteeing that `CHAMPIONSHIP` stays intact on line 2 (eliminating the orphan `'P'`), and `WORE #10–#19` wraps cleanly as `WORE` on line 1 and `#10–#19` on line 2.

---

## File 1: `src/components/Header.tsx` (Exact Surgical Diff)

In `src/components/Header.tsx`, make only these two targeted adjustments:

### Adjustment 1: Mode Switcher Padding (Lines ~140-172)
```tsx
{/* Play Mode Switcher (Ball Knower vs Casual) */}
<div className="flex rounded-lg bg-zinc-950/70 p-0.5 border border-zinc-800/80 text-[10px] sm:text-[11px] shrink-0">
  <button
    onClick={() => onToggleMode('IMMACULATE')}
    title="Ball Knower: 16 Guesses, 0 Strikes"
    className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md font-bold transition ${
      playMode === 'IMMACULATE'
        ? isScoreboard
          ? 'bg-amber-400 text-black shadow-sm'
          : isNeon
          ? 'bg-[#00f5b8] text-black shadow-sm'
          : 'bg-white text-black'
        : 'text-zinc-400 hover:text-white'
    }`}
  >
    <Flame className="h-3 w-3 shrink-0" />
    <span>Ball Knower</span>
  </button>
  <button
    onClick={() => onToggleMode('STRIKES')}
    title="Casual Mode: 4 Strikes Allowed"
    className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md font-bold transition ${
      playMode === 'STRIKES'
        ? isScoreboard
          ? 'bg-amber-400 text-black shadow-sm'
          : isNeon
          ? 'bg-cyan-400 text-black shadow-sm'
          : 'bg-white text-black'
        : 'text-zinc-400 hover:text-white'
    }`}
  >
    <span>Casual (4 Strikes)</span>
  </button>
</div>
```

### Adjustment 2: Left-Align the Action Toolbar (Line ~280)
Change the container at Section 5 from:
```tsx
{/* BEFORE (Caused buttons to float right on Row 3): */}
<div className="flex items-center gap-1.5 ml-auto sm:ml-0 shrink-0">
```
To:
```tsx
{/* AFTER (Strictly left-aligned across the row on mobile): */}
<div className="w-full sm:w-auto flex items-center justify-start gap-1.5 shrink-0 mt-1 sm:mt-0">
```

### Adjustment 3: Grand Slam Medallions Span Width of Text (Lines ~237-272)
Make the 4 circular league medallions slightly larger (`size="md"`) and space them with `justify-between` so they span the exact width of the `✨ GRAND SLAM [0/4]` text above:
```tsx
{/* ---------------------------------------------------- */}
{/* SECTION 4: GRAND SLAM & 4 LEAGUE TOKENS              */}
{/* ---------------------------------------------------- */}
<div className="flex items-center shrink-0">
  <div className="flex flex-col w-full min-w-[124px]">
    {/* Title & Pill Header */}
    <div className="flex items-center justify-between w-full text-[10px] font-black tracking-wide text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]">
      <div className="flex items-center gap-1">
        <Sparkles
          className={`w-2.5 h-2.5 ${hasGrandSlam ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`}
        />
        <span>GRAND SLAM</span>
      </div>
      <span
        className={`ml-1 px-1.5 py-0.5 rounded border text-[9px] font-mono transition-all ${
          hasGrandSlam
            ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 font-bold shadow-[0_0_8px_rgba(52,211,153,0.5)]'
            : 'bg-amber-500/15 border-amber-500/40 text-amber-200'
        }`}
      >
        {hasGrandSlam ? '-25%' : `${sportsUsed.size}/4`}
      </span>
    </div>

    {/* 4 League Medallions: Spanning full width under text */}
    <div className="flex items-center justify-between w-full mt-1.5 px-0.5">
      {ALL_SPORTS.map((sport) => {
        const isUsed = sportsUsed.has(sport);
        return (
          <LeagueIcon
            key={sport}
            sport={sport}
            size="md"
            variant="circle"
            active={isUsed}
          />
        );
      })}
    </div>
  </div>
</div>
```

*(Keep all buttons, icons, clock, and league medallions completely identical to before).*

---

## File 2: `src/components/Grid.tsx` (Exact Surgical Diff)

In `src/components/Grid.tsx`, update only the category header text and hide the `?` on mobile:

### Adjustment 1: Column Headers (Lines ~117-138)
```tsx
{/* Help Hint Icon: Visible ONLY on desktop to prevent mobile clutter */}
<span className="hidden sm:inline-block absolute top-1 right-1 sm:top-1.5 sm:right-1.5 opacity-30 sm:opacity-40 group-hover:opacity-100 transition-opacity">
  <HelpCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400/80" />
</span>

{/* Centered Category Icon (UNTOUCHED) */}
<div className="mb-0.5 sm:mb-1.5 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
  <CategoryIcon category={col} className="w-4 h-4 sm:w-7 sm:h-7" />
</div>

{/* Bold Category Name: word-break:keep-all prevents orphan letters like 'P' from splitting */}
<h3
  className={`text-[7px] min-[390px]:text-[8px] sm:text-xs font-black uppercase tracking-tight sm:tracking-wider leading-[1.05] sm:leading-tight line-clamp-2 break-normal [word-break:keep-all] px-0.5 ${
    isColHighlighted && isScoreboard
      ? 'text-amber-300'
      : isColHighlighted && isNeon
      ? 'text-[#00f5b8]'
      : 'text-zinc-100'
  }`}
>
  {col.shortName}
</h3>
```

### Adjustment 2: Row Headers (Lines ~170-191)
```tsx
{/* Help Hint Icon: Visible ONLY on desktop */}
<span className="hidden sm:inline-block absolute top-1 right-1 sm:top-1.5 sm:right-1.5 opacity-30 sm:opacity-40 group-hover:opacity-100 transition-opacity">
  <HelpCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400/80" />
</span>

{/* Centered Category Icon (UNTOUCHED) */}
<div className="mb-0.5 sm:mb-1.5 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
  <CategoryIcon category={row} className="w-4 h-4 sm:w-7 sm:h-7" />
</div>

{/* Bold Category Name: word-break:keep-all prevents orphan letters like 'P' from splitting */}
<h3
  className={`text-[7px] min-[390px]:text-[8px] sm:text-xs font-black uppercase tracking-tight sm:tracking-wider leading-[1.05] sm:leading-tight line-clamp-2 break-normal [word-break:keep-all] px-0.5 ${
    isRowHighlighted && isScoreboard
      ? 'text-amber-300'
      : isRowHighlighted && isNeon
      ? 'text-[#00f5b8]'
      : 'text-zinc-100'
  }`}
>
  {row.shortName}
</h3>
```

*(Keep the (0,0) `SportRadarDial` compass, playable cells, borders, and colors 100% UNTOUCHED).*

---

## 3. Verification Checklist

1. **Visual Match:** The UI looks 100% identical to your screenshot in color, font, icons, clock, and dial.
2. **No Clipping:** `Casual (4 Strikes)` has comfortable padding and does not clip at the right viewport edge.
3. **Left Alignment:** The action toolbar (`[🎲] [🏳️] [🔊] [❓] [🏆 Stats] [🔄]`) is anchored flush to the left on Row 3.
4. **Tile Text Fit:** `#10–#19` wraps naturally into `WORE` on line 1 and `#10–#19` on line 2 (never breaking after the hyphen), and `WON CHAMPIONSHIP` fits cleanly inside the tile without clipping.
