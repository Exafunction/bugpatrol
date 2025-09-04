import { LinearClient, LinearFetch, User } from "@linear/sdk";
import dotenv from "dotenv";
dotenv.config();

const Linear = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });

export interface BugRotationIssue {
  id: string;
  title: string;
  identifier: string;
  updatedAt: Date;
  assignee: {
    id: string;
    name: string;
    email: string;
  } | null;
  state: {
    name: string;
    type: string;
  };
  team: {
    name: string;
  };
}

export interface BugRotationRoundup { 
  assignee: {
    id: string;
    name: string;
    email: string;
  };
  issues: BugRotationIssue[];
}

// Gets issues that are in Windsurf-Product team, under the Todo state, assigned, and 
// have not been updated in over 2d. 
async function getBugRotationIssues(): Promise<BugRotationIssue[]> {
  try {
    const linearIssues = await Linear.issues({
      filter: {
        team: {
          name: {
            eq: "Windsurf-Product"
          }
        },
        state: {
          name: {
            eq: "Todo"
          }
        },
        assignee: {
          null: false
        },
        updatedAt: {
          lt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const issues: BugRotationIssue[] = [];
    
    for (const issue of linearIssues.nodes) {
      const assignee = await issue.assignee;
      const state = await issue.state;
      const team = await issue.team;

      issues.push({
        id: issue.id,
        title: issue.title,
        identifier: issue.identifier,
        updatedAt: issue.updatedAt,
        assignee: assignee ? {
          id: assignee.id,
          name: assignee.name,
          email: assignee.email
        } : null,
        state: {
          name: state?.name || '',
          type: state?.type || ''
        },
        team: {
          name: team?.name || ''
        }
      });
    }

    return issues;
  } catch (error) {
    console.error('Error fetching Windsurf-Product Bugs:', error);
    throw error;
  }
}


export async function getBugRotationRoundup(): Promise<BugRotationRoundup[]> {
  const bugRotationIssues: BugRotationIssue[] = await getBugRotationIssues();

  // Group issues by assignee
  const issuesByAssignee = new Map<string, BugRotationIssue[]>();
  
  for (const issue of bugRotationIssues) {
    if (issue.assignee) {
      const assigneeId = issue.assignee.id;
      if (!issuesByAssignee.has(assigneeId)) {
        issuesByAssignee.set(assigneeId, []);
      }
      issuesByAssignee.get(assigneeId)!.push(issue);
    }
  }

  // Convert to BugRotationRoundup objects and sort by assignee name
  const roundups: BugRotationRoundup[] = [];
  for (const [assigneeId, issues] of issuesByAssignee) {
    const assignee = issues[0].assignee!; // We know it exists from the grouping logic
    roundups.push({
      assignee: {
        id: assignee.id,
        name: assignee.name,
        email: assignee.email
      },
      issues: issues
    });
  }

  // Sort by assignee name
  roundups.sort((a, b) => a.assignee.name.localeCompare(b.assignee.name));

  return roundups;
}


  

