import axios from 'axios'
import { create } from 'zustand'

/** Global Loading ki Dukaan || Global Loading Store */
export const useLoadingStore = create((set) => ({
    loading: false,
    setLoading: (value) => set({ loading : value }),
}));

/** User store */
export const useUserStore = 
create((get, set) => ({
    user: null,
    isUserLoaded: false,
    setUser: (userObj) => set({
        user: userObj,
        isUserLoaded: true
    }),
    clearUser: () => set({ user: null, isUserLoaded: true }),
}));

/** Projects ki Dukaan | Global project store*/
export const useProjectsStore = create((set, get) => ({
    /** States */
    projects: [],
    loading: false,
    error: null,

    /** create project method */
    createProjects: async(payload, token, orgId) => {
        set({ loading: true, error : null });
        try {
            const res = await axios.post(
                `http://localhost:4114/api/users/project`,
                payload, /** Payload receive from frontend */
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            /** Set project state to cache for instanty UI updates */
            set((state) => ({
                projects: [res.data.project, ...state.projects],
                loading: false,
            }));
            return res.data.project;
        } catch (err) {
            set({
                error: err?.response?.data?.error ||
                err.message ||
                "Failed to create project",
                loading: false,
            });
            throw err;
        }
    },

    /** fetch methods */
    fetchProjects: async(orgId, getToken) => {
        console.log("Reached fetchProjects");
        const { projects } = get();
        if(projects.length > 0) return projects;

        set({loading: true, error: null});
        try {
            const token = await getToken();
            const response = await axios.get(
                `http://localhost:4114/api/users/project/${orgId}`,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                }
            );
            console.log('response.data.projects', response.data.projects)
            set({ projects : response.data.projects || [], loading: false });
        } catch (err) {
            set({
                error: err?.response?.data?.error ||
                err.message ||
                "Failed to fetch projects",
                loading: false,
            });
        }
    },

    /** delete methods */
    deleteProjects: async(projectId, getToken) => {
        set({loading: true, error: null});
        try {
            const token = await getToken();
            await axios.delete(
                `http://localhost:4114/api/users/project/delete/${projectId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            //Remove the local cache
            set((state) => ({
                projects : state.projects.filter(p => p.id !== projectId),
            }));
        } catch (err) {
            set({
                error: err?.response?.data?.error ||
                err.message ||
                "Failed to delete projects",
            });
            throw err;
        }
    } 
}));

/** Organization ki Dukaan || Global organization store
 * cache organization data by slug
 * @param {string} slug - Organization slug
*/
export const useOrganizationStore = create((set, get) => ({
    /** States */
    organizations : {},
    orgMembers: {},//map orgMembers using org slug
    loading: false,
    error: null,

    /** Method/ Actions */
    fetchOrganization : async(slug, getToken) => {
        /** Prevents re-fetching */
        const { organizations } = get();
        if(organizations[slug]) return organizations[slug];

        /** else fetch organization data */
        set({loading: true, error: null});
        try {
            const token = await getToken();
            const res = await axios.get(
                `http://localhost:4114/api/users/org/${slug}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            // storing organization data in a variable
            const org = res.data.organization || null;
            /** set organization's state */
            set((state) => ({
                organizations: { ...state.organizations, [slug]: org },
                loading: false,
            }));
            return org;
        } catch (error) {
            set({
                error: error?.response?.data?.error ||
                error?.message,
                loading: false,
            });
            return null;
        }
    },

    /** Fetch and cache organization members by slug */
    fetchOrgMembers: async(slug, getToken) => {
        const { orgMembers } = get();
        // Returning the cached version
        if(orgMembers[slug]) return orgMembers[slug];

        /** Time for actual API calls */
        set({loading: true, error: null});
        try {
            const token = await getToken();
            const res = await axios.get(
                `http://localhost:4114/api/users/org/users/${slug}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            const members = res.data.members || [];

            set((state) => ({
                orgMembers: {
                    /** Spreading the rest orgMembers by state.orgMembers  */
                    /** adding/mapping the orgmembers using slug where 
                     slug is the key whose value is the variable members  */
                    ...state.orgMembers, 
                    [slug] : members
                },
                loading: false,
            }));
            console.log('Fetching org members for column: ', members)
            return members;
        } catch (error) {
             set({
                error: error?.response?.data?.error || error?.message,
                loading: false,
            });
            return [];
        }
    }



}));

export const useSprintStore = create((set, get) => ({
    /**States */
    sprints: [],
    updatedSprint: null,
    loading: false,
    error: null,

    createSprint: async(projId, getToken, sprintData) => {
        set({ loading: true, error: null });
        try {
            const token = await getToken();
            const { data } = await axios.post(
                `http://localhost:4114/api/users/project/create-sprint/${projId}`,
                sprintData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const newlyCreatedSprint = data.sprint || null;
            set(state => ({
                sprints: [...state.sprints, newlyCreatedSprint],
                updatedSprint: newlyCreatedSprint,
                loading: false,
                error: null
            }));
            return newlyCreatedSprint;
        } catch (err) {
            set({
                loading: false,
                error: err?.response?.data?.error ||
                err.message ||
                "Failed to create sprint",
            });
            throw err;
        }
    },

    updateSprints: async(sprintId, getToken, newStatus) => {
        set({loading: true, error: null});
        try {
            const token = await getToken();
            const { data } = await axios.patch(
                `http://localhost:4114/api/users/project/sprint/update/${sprintId}`,
                {newStatus},// req from body
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                },                 
            );
            /** Store the updated sprint status */
            const updatedSprint = data.sprint || null;
            /** updating the sprint state after update */
            set(state => ({
                sprints: 
                state.sprints.map((spr) => spr.id === updatedSprint.id ? updatedSprint : spr),
                updatedSprint,
                loading: false,
                error: null
            }));
            return updatedSprint;
        } catch (err) {
             set({
                loading: false,
                error: err?.response?.data?.error ||
                err.message ||
                "Failed to update sprint",
            });
            throw err;
        }
    }
}));

export const useIssueStore = create((set, get) => ({
    sprintIssues: {},
    loading: false,
    error: null,

    createIssue: async(sprintId, getToken, issuePayload) => {
        set({loading: true, error: null});
        // Optimistic UI
        const optimisticIssue = {
            ...issuePayload,
            id: `optimistic-${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        // setting optimistic state
        set(state => ({
            sprintIssues: {
                ...state.sprintIssues,
                [sprintId]: [optimisticIssue, ...(state.sprintIssues[sprintId] || [])]
            },
            loading: false,
            error: null,
        }));
        /** real UI fetch */
        try {
            const token = await getToken();
            const { data } = await axios.post(
                `http://localhost:4114/api/users/project/${issuePayload.projId}/raise-issue`,
                issuePayload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            const createdIssue = data.issue || [];
            //Replace the optimistic state
            set(state => ({
                sprintIssues: {
                    ...state.sprintIssues,
                    [sprintId]: [createdIssue,
                        ...(state.sprintIssues[sprintId] || [])
                        .filter(issue => issue.id !== optimisticIssue.id)
                    ]
                },
                loading:false,
                error: null,
            }));
            console.log(createdIssue);
            return createdIssue;
        } catch (error) {
            // 4. Rollback: remove the optimistic issue if API fails
        set(state => ({
            sprintIssues: {
                ...state.sprintIssues,
                [sprintId]: (state.sprintIssues[sprintId] || []).filter(
                    issue => issue.id !== optimisticIssue.id
                )
            },
            loading: false,
            error: error?.response?.data?.error || error.message || "Failed to create issue",
        }));
        throw error;
        }
    },

    getIssues: async (sprintId, getToken) => {
        // const { sprintIssues } = get();
        // If issues for this sprintId are already cached (even if empty), return them
        // if (sprintIssues.hasOwnProperty(sprintId)) {
        //     return sprintIssues[sprintId];
        // }
        set({ loading: true, error: null });
        try {
            const token = await getToken();
            const { data } = await axios.get(
                `http://localhost:4114/api/users/getIssues/${sprintId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            const fetchedIssues = data.issues || [];
            set(state => ({
                sprintIssues: { ...state.sprintIssues, [sprintId]: fetchedIssues },
                loading: false,
                error: null
            }));
            console.log('Issues fetched for sprint: ', fetchedIssues)
            return fetchedIssues;
        } catch (error) {
            set({
                loading: false,
                error: error?.response?.data?.error || error.message || "Failed to fetch issues",
            });
            return [];
        }
    },

    updateIssue: async(sprintId, newIssues, getToken) => {
        console.log('UpdateIssues for sprintId reached mf : ');
        console.log("Payload sent to backend:", newIssues.map(i => i.id));
        set({ loading: false, error: null });
        try {
            const token = await getToken();
            const { data } = await axios.patch(
                `http://localhost:4114/api/users/issues/update`,
                newIssues,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": 'application/json',
                    }
                }
            );

            console.log('Updated issues: ', data);

            if(data.success === true){
                set(state => ({
                    sprintIssues: {
                        ...state.sprintIssues,
                        [sprintId]: data.result
                    },
                    loading: false,
                    error: null,
                }))
            }
            return data.result;
        } catch (error) {
            set(state => ({
                ...state,
                loading: false,
                error: error?.response?.data?.error || error.message || "Failed to update issues",
            }));
            console.error('Error updating issues:', error);
            throw error; 
        }
    },

    editIssue: async(sprintId, issueId, updatedFields, getToken) => {
        set({ loading: false, error: null });
        try {
            const token = await getToken();
            const { data } = await axios.put(
                `http://localhost:4114/api/users/issues/${issueId}`,
                updatedFields,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": 'application/json',
                    }
                }
            );
            if(data.success){
                set(state => ({
                    sprintIssues: {
                        ...state.sprintIssues,
                        [sprintId]: state.sprintIssues[sprintId]
                        .map(issue => 
                            issue.id === issueId ? data.issue : issue
                        )
                    },
                    loading: false,
                    error: null,
                }));
                return data.issue;
            }
        }catch(error){
            set(state => ({
                ...state,
                loading: false,
                error: error?.response?.data?.error || error.message || "Failed to update issue",
            }));
            console.error('Error updating editIssue in zustand:', error);
            throw error;
        }    
    },
}));

export const useCommentStore = create((set, get) => ({
    issueComments: {},//store issue comments [issueId]: [comments]
    loading: false,
    error: null,

    /* Get comment and populate it to issueComments */
    getComments: async(issueId, getToken) => {
        // const { issueComments } = get();
        // If comments for this issueId are already cached (even if empty), return them
        // if(issueComments[issueId]){
        //     return issueComments[issueId];
        // };
        set({ loading: true, error: null });

        /** Fetch comments from API */
        try {
            const token = await getToken();
            const { data } = await axios.get(
                `http://localhost:4114/api/users/issues/${issueId}/comments`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            const comments = data.comments || [];
            set(state => ({
                issueComments: {
                    ...state.issueComments,
                    [issueId]: [
                        ...comments, // spread the comments
                        ...(state.issueComments[issueId] || []) // keep existing comments if any
                    ]
                },
                loading: false,
                error: null,
            }));
            return comments;
        } catch (error) {
            set({
                loading: false,
                error: error?.response?.data?.error || error.message || "Failed to fetch comments",
            });
            throw error;
        }
    },

    /* Create comment for an issue */
    createComment: async(issueId, commentData, getToken) => {
        /** Optimistic UI */
        const optimisticComment = {
            ...commentData,
            id: `optimistic-${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        set(state => ({
            issueComments: {
                ...state.issueComments,
                [issueId]: [
                    optimisticComment,
                    ...(state.issueComments[issueId] || []),
                ]
            }
        }));
        /** Real UI fetch */
        try {
            const token = await getToken();
            const { data } = await axios.post(
                `http://localhost:4114/api/users/issues/${issueId}/create_comments`,
                commentData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": 'application/json',
                    }
                }
            );
            // Replace the optimistic comment with the real one
            const newlyCreatedComment = data.comment || null;
            set(state => ({
                issueComments: {//mutating issueComments state
                    ...state.issueComments,//copying all the key val pairs from issueComments object
                    [issueId]: [
                        newlyCreatedComment,
                        // rest all are previously created comments
                        ...(state.issueComments[issueId] || [])
                        .filter(c => c.id !== optimisticComment.id) //filtering out the optimistic comments
                    ]
                }
            }));
            return newlyCreatedComment;
        } catch (error) {
            // remove optimistic comment if API fails
            set(state => ({
                issueComments: {
                    ...state.issueComments,
                    [issueId] : [
                        /** filtering out the optimistic comments */
                        (state.issueComments[issueId] || [])
                        .filter(c => c.id !== optimisticComment.id)
                    ]
                },
                error: error?.response?.data?.error ||
                error.message || "Failed to create comment",
                loading: false,
            }));
            throw error;
        }
    },

    addComment: (issueId, comment) => {
        set(state => {
            const existing = state.issueComments[issueId] || [];
            if(existing.some(c => c.id === comment.id)) return {};
            return {
                issueComments: {
                    ...state.issueComments,
                    [issueId]: [
                        ...existing, // keep existing comments
                        comment // add the new comment at the start
                    ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // sort by createdAt
                }
            }
        })
    },
}));

export const useIssueAcrossMultSprint = create((set, get) => ({
    allIssues: [],
    assignedIssue: [],
    reportedIssue: [],
    loading: false,
    error: null,

    fetchIssueAcrossSprint: async(getToken, userId) => {
        set({loading: true, error: null});

        try {
            const token = await getToken();
            const { data } = await axios.get(
                `http://localhost:4114/api/users/getIssues`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            const allIssue = data?.issues || [];
            console.log("data of project ",data);
            /** Set the assigned and reported issue */
            set({
                allIssues: allIssue,
                assignedIssue: allIssue.filter(issue => issue?.assignee.clerkUserId === userId),
                reportedIssue: allIssue.filter(issue => issue?.reporter.clerkUserId === userId),
                loading: false,
                error: null,
            })
        } catch (error) {
            set({
                loading: false,
                error: error?.response?.data?.error ||
                error?.message || 'Failed to fetch issues'
            });
        }
    },
}));