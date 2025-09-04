export interface BugRotationIssue {
  id: string;
  title: string;
  identifier: string;
  link: string;
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
