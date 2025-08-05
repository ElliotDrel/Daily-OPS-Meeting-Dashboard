import { format, parseISO } from 'date-fns'
import { PillarData, ActionItem, MeetingNote } from '@/hooks/useEmailData'

// Map pillar names to email section titles
const PILLAR_TITLES: Record<string, string> = {
  safety: 'Safety',
  quality: 'Quality',
  cost: 'Cost',
  delivery: 'Delivery and Logistics',
  inventory: 'Inventory and Stockout Risk',
  production: 'Production Performance',
  people: 'People and Workforce'
}

// Format action items for email display
const formatActionItems = (actionItems: ActionItem[], label: string): string => {
  if (!actionItems || actionItems.length === 0) return ''
  
  const formattedItems = actionItems.map(item => {
    const assigneeText = item.assignee ? ` *(${item.assignee}` : ' *('
    const dueDateText = item.due_date ? `, ${format(parseISO(item.due_date), 'MMM d')}` : ''
    const statusText = item.status && item.status !== 'Open' ? `, ${item.status}` : ''
    const priorityText = item.priority && item.priority !== 'Medium' ? `, ${item.priority}` : ''
    
    return `- ${item.description}${assigneeText}${dueDateText}${statusText}${priorityText})*`
  }).join('\n')

  return `\n### ${label}\n${formattedItems}`
}

// Format meeting notes for email display
const formatMeetingNotes = (note: MeetingNote | null, label: string): string => {
  if (!note || !note.keyPoints || note.keyPoints.length === 0) return ''
  
  const formattedNotes = note.keyPoints.map((point: string) => `- ${point}`).join('\n')
  
  return `\n### ${label}\n${formattedNotes}`
}

// Format a single pillar section
const formatPillarSection = (pillarData: PillarData): string => {
  const { pillar, todayNote, todayActionItems, yesterdayNote, yesterdayActionItems } = pillarData
  const title = PILLAR_TITLES[pillar] || pillar.charAt(0).toUpperCase() + pillar.slice(1)
  
  // Check if there's any content for this pillar
  const hasTodayContent = todayNote?.keyPoints?.length > 0 || todayActionItems?.length > 0
  const hasYesterdayContent = yesterdayNote?.keyPoints?.length > 0 || yesterdayActionItems?.length > 0
  
  if (!hasTodayContent && !hasYesterdayContent) {
    return '' // Skip pillars with no content
  }
  
  let section = `\n## ${title}`
  
  // Add today's content
  if (todayNote?.keyPoints?.length > 0) {
    section += formatMeetingNotes(todayNote, 'Summary')
  }
  
  if (todayActionItems?.length > 0) {
    section += formatActionItems(todayActionItems, 'Action Items')
  }
  
  // Add yesterday's content if it exists
  if (yesterdayNote?.keyPoints?.length > 0) {
    section += formatMeetingNotes(yesterdayNote, "Yesterday's Summary")
  }
  
  if (yesterdayActionItems?.length > 0) {
    section += formatActionItems(yesterdayActionItems, "Yesterday's Action Items")
  }
  
  section += '\n\n---'
  
  return section
}

export const generateEmail = (emailData: PillarData[], selectedDate: string): string => {
  const formattedDate = format(parseISO(selectedDate), 'MMMM d, yyyy')
  
  // Email header
  let email = `# Manufacturing Daily Huddle Meeting Notes\n**Date:** ${formattedDate}\n---`
  
  // Process each pillar and add sections with content
  const pillarSections = emailData
    .map(pillarData => formatPillarSection(pillarData))
    .filter(section => section.trim() !== '') // Only include pillars with content
  
  if (pillarSections.length === 0) {
    email += '\n\n*No meeting notes or action items found for the selected dates.*'
  } else {
    email += pillarSections.join('')
    // Remove the last separator
    email = email.replace(/\n\n---$/, '')
  }
  
  // Remove all empty lines (lines with only whitespace)
  email = email.replace(/^\s*\n/gm, '')
  
  return email
}