import { WebClient } from "@slack/web-api";
import { BugRotationRoundup, BugRotationIssue } from "./types";
import dotenv from "dotenv";

dotenv.config();

const webClient = new WebClient(process.env.SLACK_BOT_TOKEN);

const getSlackUserIdByEmail = async (email: string): Promise<string | null> => {
  try {
    // Convert @cognition.ai emails to @windsurf.com emails
    let lookupEmail = email;
    if (email.endsWith('@cognition.ai')) {
      lookupEmail = email.replace('@cognition.ai', '@windsurf.com');
    }
    
    const result = await webClient.users.lookupByEmail({ email: lookupEmail });
    return result.user?.id || null;
  } catch (error) {
    console.error(`Failed to find Slack user for email ${email}:`, error);
    return null;
  }
};

export const issueToString = (issue: BugRotationIssue) => {
    return `• <${issue.link}|[${issue.identifier}]> ${issue.title}`;
}

export const assigneeToString = async (assignee: BugRotationRoundup["assignee"]): Promise<string> => {
  const slackUserId = await getSlackUserIdByEmail(assignee.email);
  
  if (slackUserId) {
    return `<@${slackUserId}>`;
  } else {
    // Fallback to display name if Slack user not found
    return `${assignee.name}`;
  }
};

export async function sendBugRotationRoundup(roundup: BugRotationRoundup[]) {
  const channel = process.env.SLACK_CHANNEL_ID;
  
  if (!channel) {
    throw new Error('SLACK_CHANNEL_ID environment variable is required');
  }

  // Create list of assignees for the main post
  const assigneeList = await Promise.all(
    roundup.map(r => assigneeToString(r.assignee))
  );
  
  const mainMessage = `BugPatrol alert! ${assigneeList.join(', ')}: you have bugs that need updates. Please either (A) update the bug status if you are working on it or (B) unassign yourself. See the thread below for a list:`;

  // Send the main post
  const mainPost = await webClient.chat.postMessage({
    channel,
    text: mainMessage,
    unfurl_links: false,
    unfurl_media: false,
  });

  // Send threaded replies for each assignee
  for (let i = 0; i < roundup.length; i++) {
    const assignee = roundup[i];
    const assigneeString = await assigneeToString(assignee.assignee);
    const issueList = assignee.issues.map(issue => issueToString(issue)).join('\n');
    
    const threadReply = `${assigneeString} Please update the following tickets:\n${issueList}\n\n─────────────────────`;

    await webClient.chat.postMessage({
      channel,
      text: threadReply,
      thread_ts: mainPost.ts, // This makes it a threaded reply
      unfurl_links: false,
      unfurl_media: false,
    });
  }
}

