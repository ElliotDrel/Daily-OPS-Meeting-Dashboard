import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/sonner";
import { Copy, ChevronDown, ChevronRight, Check } from "lucide-react";

export const CreateMeetingEmail = () => {
  const [transcript, setTranscript] = useState("");
  const [meetingNotes, setMeetingNotes] = useState("");
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [showEmailsPreview, setShowEmailsPreview] = useState(false);
  const [showSubjectPreview, setShowSubjectPreview] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [emailsCopied, setEmailsCopied] = useState(false);
  const [subjectCopied, setSubjectCopied] = useState(false);
  const [flashTranscript, setFlashTranscript] = useState(false);
  const [flashNotes, setFlashNotes] = useState(false);

  const isFormValid = transcript.trim() !== "" && meetingNotes.trim() !== "";

  const generatePrompt = () => {
    const promptTemplate = `<goal>Using all the attached info, create meeting notes in the same format as the yesterdays notes (<yesterdaysnotes>).</goal> <additonalinstructions>1. Use yesterday's notes (<yesterdaysnotes>) to find out in what style, format, and structure I want your output structured. Your output should be in the same style, format, and structure as yesterday's notes (<yesterdaysnotes>). 2. Use yesterday's notes (<yesterdaysnotes>) plus my notes (<mynotes>) to find what was covered in the last meeting and add that to the proper sections. 3. Use the transcript (<transcript>) to collect and identify what was covered in today's meeting to fill in the proper sections.</additonalinstructions> <outputformat>Output in the same format, style and structure as yesterday's notes (<yesterdaysnotes>). Ensure your notes are to the same level of detail as the example notes. </outputformat>

<transcript>${transcript}</transcript>

<mynotes>${meetingNotes}</mynotes>

<yesterdaysnotes># Manufacturing Daily Huddle Meeting Notes

## Executive Summary

The team relocated the daily huddle to the manufacturing office to improve attendance and punctuality, working through initial AV setup challenges. Production showed strong improvement with **1,634 units** yesterday, though month-to-date attainment remains at **50%** with **4,757 bikes short** of plan. Key focuses included managing the incoming surge of twenty-four containers over eight workdays, addressing persistent quality issues with bent cranks, and evaluating a DC redistribution freeze that could increase shipping costs by **$200,000** during sales periods.

---

## Safety

### Summary
- No new incidents reported
- Preparing for extreme heat with **107-degree heat index** expected Thursday
- Insurance walkthrough completed with no findings, proceeding with new carrier transition
- Continuing to emphasize hydration and heat safety protocols across all facilities

### Action Items
- **Monitor heat safety compliance** and push water breaks during high heat index days *(All supervisors, ongoing)*

### Yesterday's Action Items
- Employee-only sign for G4 door remains **pending**; Limble ticket submitted
- Weather-area signage audit continues for non-G10 buildings

---

## Quality

### Summary
- **Bent cranks persist** as primary quality concern; Frank working on resolution but communication remains limited to one reply per week
- Previous issues with wobbly single-speed freewheels and paint adhesion on rims continue under Frank's oversight

### Action Items
- **Follow up with Frank** on bent crank corrective action plan *(Lou, Jul 24)*
- **Maintain pressure on Frank** for more frequent quality updates *(Lou, ongoing)*

### Yesterday's Action Items
- Awaiting Frank's detailed response on bent crank root cause; supplier needs additional information

---

## Inventory and Stockout Risk

### Summary
Proposed DC redistribution freeze for **14-inch, 26-inch, and Adult Small models** reveals $10-per-shipment cost increase from Indiana fulfillment. Analysis shows potential **$200,000 shipping cost impact** per 20,000 orders during sales. 

**Production Gap Analysis:**
- Current shortfall: **4,757 bikes**
- Remaining planned days: **6 days**
- Required daily output: **2,793 units** (scheduled days only) or **1,862 units** (including weekends)

### Action Items
- **Follow up with Arpon** on cost assumptions and clarify DC inventory availability scenarios *(Lou & Jennica, Jul 24)*
- **Determine switch timing** considering upcoming sales events *(Lou & Arpon, Jul 25)*

### Yesterday's Action Items
- Cost study initiated showing $19-20 base shipping cost versus $10 premium for Indiana direct fulfillment

---

## Delivery and Logistics

### Summary
- **2 containers received** of 24 expected over next 8 workdays
- New zone-based unloading system showing promise with smooth first container processing
- Additional **26 containers** either in LA port or on water
- Maintaining high-volume cadence through mid-August

### Action Items
- **Maintain extended staffing coverage** for 3-4 week container surge *(Troy, ongoing)*
- **Monitor zone-based container system** effectiveness and adjust as needed *(Troy, Jul 24)*

### Yesterday's Action Items
- Staffing plan executed with 3 temps daily this week, 4 next week

---

## Production Performance

### Summary
- Strong output of **1,634 units yesterday** with another robust day expected
- New workshop initiated to push value improvements
- **Fork production started** on 16-inch models with fixtures for 20-inch and 14-inch in development
- **Powder coat line fire-up** scheduled for tomorrow

### Action Items
- **Integrate fork and powder coat production** into daily tracking metrics *(Production team, Jul 25)*
- **Coordinate Martin cleaning setup** for powder coat area *(Lou, Jul 24)*

### Yesterday's Action Items
- Changeover reduction and new-hire integration continuing per plan

---

## People and Staffing

### Summary
- Turnover challenges persist with **21% daily attendance call-ins** continuing for weeks
- Middle-of-summer timing makes high absenteeism particularly concerning for production targets

### Action Items
- **Develop retention strategy** to address 21% call-in rate *(HR, Jul 25)*
- **Implement daily attendance monitoring** with 4-hour backfill target *(HR, ongoing)*

### Yesterday's Action Items
- Sanitizer and wipes placement in restrooms pending completion

---

## Facility and Trailers

### Summary
- No new trailer issues reported
- Zone system implementation in warehouses showing early success

### Action Items
- **Order 6 metal scrap bins** for G1 from Kroots *(Jennica, Jul 24)*
- **Obtain updated truck tracker** from Mike *(Jennica, Jul 24)*

### Yesterday's Action Items
- Annual trailer inspection report and damage documentation actions carry forward

---

## Escalations and Open Decisions

1. **DC redistribution freeze decision** pending final cost-benefit analysis considering sales impact
2. **Full inventory count** scheduled August 8 requiring trusted volunteer counters
3. **Fork and powder coat production integration** into daily metrics system

---

## Consolidated Action Items

### Immediate (July 24)
- Follow up with Frank on bent crank resolution and communication frequency *(Lou)*
- Complete Arpon cost assumption review for DC freeze decision *(Lou & Jennica)*
- Update tracking systems for fork and powder coat operations *(Lou)*
- Order 6 metal scrap bins from Kroots for G1 *(Jennica)*
- Obtain truck tracker update from Mike *(Jennica)*
- Monitor zone-based container system effectiveness *(Troy)*
- Coordinate Martin cleaning service for powder coat startup *(Lou)*

### Short-term (July 25)
- Determine DC switch timing considering sales events *(Lou & Arpon)*
- Integrate fork and powder coat into daily tracking *(Production team)*
- Develop retention strategy for 21% call-in rate *(HR)*

### Medium-term (August 8)
- Schedule and staff full inventory count *(All sites)*

### Ongoing
- Maintain extended dock staffing through August container surge *(Troy)*
- Address 21% attendance issue with retention plan *(HR)*
- Push hydration protocols during extreme heat days *(All supervisors)*
- Maintain pressure on Frank for quality updates *(Lou)*</yesterdaysnotes>`;

    return promptTemplate;
  };

  const generateColoredPrompt = () => {
    const instructionsSection = `<span class="text-blue-600">&lt;goal&gt;Using all the attached info, create meeting notes in the same format as the yesterdays notes (&lt;yesterdaysnotes&gt;).&lt;/goal&gt; &lt;additonalinstructions&gt;1. Use yesterday's notes (&lt;yesterdaysnotes&gt;) to find out in what style, format, and structure I want your output structured. Your output should be in the same style, format, and structure as yesterday's notes (&lt;yesterdaysnotes&gt;). 2. Use yesterday's notes (&lt;yesterdaysnotes&gt;) plus my notes (&lt;mynotes&gt;) to find what was covered in the last meeting and add that to the proper sections. 3. Use the transcript (&lt;transcript&gt;) to collect and identify what was covered in today's meeting to fill in the proper sections.&lt;/additonalinstructions&gt; &lt;outputformat&gt;Output in the same format, style and structure as yesterday's notes (&lt;yesterdaysnotes&gt;). Ensure your notes are to the same level of detail as the example notes. &lt;/outputformat&gt;</span>`;
    
    const transcriptSection = `<span class="text-green-600">&lt;transcript&gt;${transcript || "[PASTE YOUR TRANSCRIPT CONTENT HERE]"}&lt;/transcript&gt;</span>`;
    
    const notesSection = `<span class="text-purple-600">&lt;mynotes&gt;${meetingNotes || "[PASTE YOUR MEETING NOTES CONTENT HERE]"}&lt;/mynotes&gt;</span>`;
    
    const templateSection = `<span class="text-amber-600">&lt;yesterdaysnotes&gt;# Manufacturing Daily Huddle Meeting Notes

## Executive Summary

The team relocated the daily huddle to the manufacturing office to improve attendance and punctuality, working through initial AV setup challenges. Production showed strong improvement with **1,634 units** yesterday, though month-to-date attainment remains at **50%** with **4,757 bikes short** of plan. Key focuses included managing the incoming surge of twenty-four containers over eight workdays, addressing persistent quality issues with bent cranks, and evaluating a DC redistribution freeze that could increase shipping costs by **$200,000** during sales periods.

---

## Safety

### Summary
- No new incidents reported
- Preparing for extreme heat with **107-degree heat index** expected Thursday
- Insurance walkthrough completed with no findings, proceeding with new carrier transition
- Continuing to emphasize hydration and heat safety protocols across all facilities

### Action Items
- **Monitor heat safety compliance** and push water breaks during high heat index days *(All supervisors, ongoing)*

### Yesterday's Action Items
- Employee-only sign for G4 door remains **pending**; Limble ticket submitted
- Weather-area signage audit continues for non-G10 buildings

---

## Quality

### Summary
- **Bent cranks persist** as primary quality concern; Frank working on resolution but communication remains limited to one reply per week
- Previous issues with wobbly single-speed freewheels and paint adhesion on rims continue under Frank's oversight

### Action Items
- **Follow up with Frank** on bent crank corrective action plan *(Lou, Jul 24)*
- **Maintain pressure on Frank** for more frequent quality updates *(Lou, ongoing)*

### Yesterday's Action Items
- Awaiting Frank's detailed response on bent crank root cause; supplier needs additional information

---

## Inventory and Stockout Risk

### Summary
Proposed DC redistribution freeze for **14-inch, 26-inch, and Adult Small models** reveals $10-per-shipment cost increase from Indiana fulfillment. Analysis shows potential **$200,000 shipping cost impact** per 20,000 orders during sales. 

**Production Gap Analysis:**
- Current shortfall: **4,757 bikes**
- Remaining planned days: **6 days**
- Required daily output: **2,793 units** (scheduled days only) or **1,862 units** (including weekends)

### Action Items
- **Follow up with Arpon** on cost assumptions and clarify DC inventory availability scenarios *(Lou & Jennica, Jul 24)*
- **Determine switch timing** considering upcoming sales events *(Lou & Arpon, Jul 25)*

### Yesterday's Action Items
- Cost study initiated showing $19-20 base shipping cost versus $10 premium for Indiana direct fulfillment

---

## Delivery and Logistics

### Summary
- **2 containers received** of 24 expected over next 8 workdays
- New zone-based unloading system showing promise with smooth first container processing
- Additional **26 containers** either in LA port or on water
- Maintaining high-volume cadence through mid-August

### Action Items
- **Maintain extended staffing coverage** for 3-4 week container surge *(Troy, ongoing)*
- **Monitor zone-based container system** effectiveness and adjust as needed *(Troy, Jul 24)*

### Yesterday's Action Items
- Staffing plan executed with 3 temps daily this week, 4 next week

---

## Production Performance

### Summary
- Strong output of **1,634 units yesterday** with another robust day expected
- New workshop initiated to push value improvements
- **Fork production started** on 16-inch models with fixtures for 20-inch and 14-inch in development
- **Powder coat line fire-up** scheduled for tomorrow

### Action Items
- **Integrate fork and powder coat production** into daily tracking metrics *(Production team, Jul 25)*
- **Coordinate Martin cleaning setup** for powder coat area *(Lou, Jul 24)*

### Yesterday's Action Items
- Changeover reduction and new-hire integration continuing per plan

---

## People and Staffing

### Summary
- Turnover challenges persist with **21% daily attendance call-ins** continuing for weeks
- Middle-of-summer timing makes high absenteeism particularly concerning for production targets

### Action Items
- **Develop retention strategy** to address 21% call-in rate *(HR, Jul 25)*
- **Implement daily attendance monitoring** with 4-hour backfill target *(HR, ongoing)*

### Yesterday's Action Items
- Sanitizer and wipes placement in restrooms pending completion

---

## Facility and Trailers

### Summary
- No new trailer issues reported
- Zone system implementation in warehouses showing early success

### Action Items
- **Order 6 metal scrap bins** for G1 from Kroots *(Jennica, Jul 24)*
- **Obtain updated truck tracker** from Mike *(Jennica, Jul 24)*

### Yesterday's Action Items
- Annual trailer inspection report and damage documentation actions carry forward

---

## Escalations and Open Decisions

1. **DC redistribution freeze decision** pending final cost-benefit analysis considering sales impact
2. **Full inventory count** scheduled August 8 requiring trusted volunteer counters
3. **Fork and powder coat production integration** into daily metrics system

---

## Consolidated Action Items

### Immediate (July 24)
- Follow up with Frank on bent crank resolution and communication frequency *(Lou)*
- Complete Arpon cost assumption review for DC freeze decision *(Lou & Jennica)*
- Update tracking systems for fork and powder coat operations *(Lou)*
- Order 6 metal scrap bins from Kroots for G1 *(Jennica)*
- Obtain truck tracker update from Mike *(Jennica)*
- Monitor zone-based container system effectiveness *(Troy)*
- Coordinate Martin cleaning service for powder coat startup *(Lou)*

### Short-term (July 25)
- Determine DC switch timing considering sales events *(Lou & Arpon)*
- Integrate fork and powder coat into daily tracking *(Production team)*
- Develop retention strategy for 21% call-in rate *(HR)*

### Medium-term (August 8)
- Schedule and staff full inventory count *(All sites)*

### Ongoing
- Maintain extended dock staffing through August container surge *(Troy)*
- Address 21% attendance issue with retention plan *(HR)*
- Push hydration protocols during extreme heat days *(All supervisors)*
- Maintain pressure on Frank for quality updates *(Lou)*&lt;/yesterdaysnotes&gt;</span>`;

    return `${instructionsSection}

${transcriptSection}

${notesSection}

${templateSection}`;
  };

  const handleTogglePromptPreview = () => {
    setShowPromptPreview(!showPromptPreview);
    setShowEmailsPreview(false);
    setShowSubjectPreview(false);
  };

  const handleToggleEmailsPreview = () => {
    setShowEmailsPreview(!showEmailsPreview);
    setShowPromptPreview(false);
    setShowSubjectPreview(false);
  };

  const handleToggleSubjectPreview = () => {
    setShowSubjectPreview(!showSubjectPreview);
    setShowPromptPreview(false);
    setShowEmailsPreview(false);
  };

  const handleValidationError = () => {
    toast.error("Please fill in both text areas to enable copying", {
      duration: 3000,
    });

    // Flash empty text areas
    if (transcript.trim() === '') {
      setFlashTranscript(true);
      setTimeout(() => setFlashTranscript(false), 1000);
    }
    if (meetingNotes.trim() === '') {
      setFlashNotes(true);
      setTimeout(() => setFlashNotes(false), 1000);
    }
  };

  const emailSubject = "Meeting Overview & Action Items - Daily Tier 3 OPS Meeting";
  
  const emails = `Adam Stroobandt <adam.stroobandt@guardianbikes.com>,
Amber Wilber <amber.wilber@guardianbikes.com>,
Arpan Ojha <arpan.ojha@guardianbikes.com>,
Ashley Campbell <ashley.campbell@guardianbikes.com>,
Courtney Fasnacht <courtney.fasnacht@guardianbikes.com>,
Jennica Harding <jennica.harding@guardianbikes.com>,
Kaitlin Keirsted <kaitlin.keirsted@guardianbikes.com>,
Kyle Jansen <kyle.jansen@guardianbikes.com>,
Kyle Jansen <kyle@guardianbikes.com>,
Lou Ochs <lou.ochs@guardianbikes.com>,
Mary Shipman <mary.shipman@guardianbikes.com>,
Matt Craig <matt.craig@guardianbikes.com>,
Mike Ayers <mike.ayers@guardianbikes.com>,
Natalie Mathern <natalie.mathern@guardianbikes.com>,
Ryan Beecher <ryan.beecher@guardianbikes.com>,
Ryan Jansen <ryan.jansen@guardianbikes.com>,
Sam Markel <sam.markel@guardianbikes.com>,
Troy Mobley <troy.mobley@guardianbikes.com>,
Brian Riley <brian@guardianbikes.com>`;

  const handleCopyPrompt = async () => {
    if (!isFormValid) {
      handleValidationError();
      return;
    }

    try {
      const prompt = generatePrompt();
      await navigator.clipboard.writeText(prompt);
      setPromptCopied(true);
      toast.success("Prompt copied! Paste this into ChatGPT now.", {
        duration: 4000,
      });
      setTimeout(() => setPromptCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy prompt. Please try again.");
    }
  };

  const handleCopyEmails = async () => {
    if (!isFormValid) {
      handleValidationError();
      return;
    }

    try {
      await navigator.clipboard.writeText(emails);
      setEmailsCopied(true);
      toast.success("Email addresses copied to clipboard!", {
        duration: 3000,
      });
      setTimeout(() => setEmailsCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy emails. Please try again.");
    }
  };

  const handleCopySubject = async () => {
    if (!isFormValid) {
      handleValidationError();
      return;
    }

    try {
      await navigator.clipboard.writeText(emailSubject);
      setSubjectCopied(true);
      toast.success("Email subject copied to clipboard!", {
        duration: 3000,
      });
      setTimeout(() => setSubjectCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy subject. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50/30">
      <div className="container mx-auto px-6 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Create Meeting Email
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Generate AI prompts to create structured meeting notes. Paste your transcript and meeting notes below, 
              then copy the generated prompt to use with ChatGPT for consistent, professional meeting summaries.
            </p>
          </div>

          {/* Main Content */}
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Build Your Prompt</CardTitle>
              <CardDescription>
                Fill in both sections below to generate a complete AI prompt for creating meeting notes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Transcript Input */}
              <div className="space-y-2">
                <Label htmlFor="transcript" className="text-base font-medium">
                  Paste Transcript Here
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Textarea
                        id="transcript"
                        placeholder="Paste your meeting transcript here..."
                        className={`resize-y transition-all duration-300 ${
                          transcript.trim() === '' ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                        } ${
                          flashTranscript ? 'border-red-500 bg-red-50 shadow-lg shadow-red-200' : ''
                        }`}
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                      />
                    </TooltipTrigger>
                    {transcript.trim() === '' && (
                      <TooltipContent>
                        <p>Please fill in both text areas to enable all copy buttons</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Meeting Notes Input */}
              <div className="space-y-2">
                <Label htmlFor="meeting-notes" className="text-base font-medium">
                  Paste Meeting Notes Here
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Textarea
                        id="meeting-notes"
                        placeholder="Paste your meeting notes here..."
                        className={`resize-y transition-all duration-300 ${
                          meetingNotes.trim() === '' ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                        } ${
                          flashNotes ? 'border-red-500 bg-red-50 shadow-lg shadow-red-200' : ''
                        }`}
                        value={meetingNotes}
                        onChange={(e) => setMeetingNotes(e.target.value)}
                      />
                    </TooltipTrigger>
                    {meetingNotes.trim() === '' && (
                      <TooltipContent>
                        <p>Please fill in both text areas to enable all copy buttons</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Instructions */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3 text-center">Complete Workflow</h3>
                <div className="text-blue-800 text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-blue-600 min-w-[20px]">1.</span>
                    <span>Click <strong>"Copy Full Prompt"</strong> and paste into <strong>ChatGPT o3</strong> for optimal results</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-blue-600 min-w-[20px]">2.</span>
                    <span>Let AI generate your structured meeting notes</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-blue-600 min-w-[20px]">3.</span>
                    <span>Click <strong>"Copy Emails"</strong> to get recipient list for your email client</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-blue-600 min-w-[20px]">4.</span>
                    <span>Click <strong>"Copy Subject"</strong> to get the standardized email subject line</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-blue-600 min-w-[20px]">5.</span>
                    <span>Email the AI-generated meeting notes to your team!</span>
                  </div>
                </div>
              </div>

              {/* Copy Buttons */}
              <div className="flex justify-center gap-4 pt-4 flex-wrap">
                <Button
                  onClick={handleCopyPrompt}
                  size="lg"
                  className={`min-w-[150px] transition-all ${promptCopied 
                    ? 'bg-green-600 hover:bg-green-600 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {promptCopied ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {promptCopied ? 'Copied!' : 'Copy Full Prompt'}
                </Button>
                <Button
                  onClick={handleCopyEmails}
                  size="lg"
                  className={`min-w-[150px] transition-all ${emailsCopied 
                    ? 'bg-green-600 hover:bg-green-600 text-white border-green-600' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                  }`}
                >
                  {emailsCopied ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {emailsCopied ? 'Copied!' : 'Copy Emails'}
                </Button>
                <Button
                  onClick={handleCopySubject}
                  size="lg"
                  className={`min-w-[150px] transition-all ${subjectCopied 
                    ? 'bg-green-600 hover:bg-green-600 text-white border-green-600' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600'
                  }`}
                >
                  {subjectCopied ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {subjectCopied ? 'Copied!' : 'Copy Subject'}
                </Button>
              </div>

              {/* Preview Toggles */}
              <div className="flex justify-center gap-4 pt-4 flex-wrap">
                <Button
                  variant="outline"
                  onClick={handleTogglePromptPreview}
                  className="flex items-center gap-2"
                >
                  {showPromptPreview ? (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Hide Prompt Preview
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-4 h-4" />
                      Show Prompt Preview
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleToggleEmailsPreview}
                  className="flex items-center gap-2"
                >
                  {showEmailsPreview ? (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Hide Emails Preview
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-4 h-4" />
                      Show Emails Preview
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleToggleSubjectPreview}
                  className="flex items-center gap-2"
                >
                  {showSubjectPreview ? (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Hide Subject Preview
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-4 h-4" />
                      Show Subject Preview
                    </>
                  )}
                </Button>
              </div>

              {/* Prompt Preview */}
              {showPromptPreview && (
                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    Generated Prompt Preview
                  </Label>
                  <div className="min-h-[300px] p-4 border rounded-md bg-muted font-mono text-xs overflow-auto whitespace-pre-wrap">
                    <div dangerouslySetInnerHTML={{ __html: generateColoredPrompt() }} />
                  </div>
                </div>
              )}

              {/* Emails Preview */}
              {showEmailsPreview && (
                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    Email Recipients Preview
                  </Label>
                  <div className="p-4 border rounded-md bg-muted font-mono text-xs overflow-auto">
                    <p className="text-muted-foreground text-xs mb-2">Email addresses (comma-separated):</p>
                    <div className="whitespace-pre-wrap">{emails}</div>
                  </div>
                </div>
              )}

              {/* Subject Preview */}
              {showSubjectPreview && (
                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    Email Subject Preview
                  </Label>
                  <div className="p-4 border rounded-md bg-muted font-mono text-sm overflow-auto">
                    <p className="text-muted-foreground text-xs mb-2">Email subject line:</p>
                    <div className="font-semibold">{emailSubject}</div>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};