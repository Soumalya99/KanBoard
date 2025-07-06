import React, { useEffect, useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs';
import { useAuth } from '@clerk/clerk-react'
import { useIssueAcrossMultSprint } from '../../store/zustandStore';
import { BarLoader } from 'react-spinners';
import IssueCard from './IssueCard';

const IssueAcross = ({ userId }) => {
    const [tabState, setTabState] = useState('assigned');
    const { getToken } = useAuth();
    const {
       allIssues, assignedIssue, reportedIssue, error, loading, fetchIssueAcrossSprint
    } = useIssueAcrossMultSprint();

    useEffect(() => {
        // Only fetch if userId is defined
        if (!userId) return;
        const fetchData = async () => {
            try {
                await fetchIssueAcrossSprint(getToken, userId);
            } catch (err) {
                console.error('Error fetching issues:', err);
            }
        };
        fetchData();
    }, [getToken, userId, fetchIssueAcrossSprint]);


    return (
        <div>
            <h1 className='mb-4 font-semibold text-2xl gradient-warn ml-4'>My Issues</h1>
            <Tabs.Root value={tabState} onValueChange={setTabState} className=''>
                <Tabs.List className='flex gap-3 flex-wrap mb-3'>
                    <Tabs.Trigger value='assigned' className='px-3 py-1 rounded transition
    data-[state=active]:bg-blue-600 data-[state=active]:text-white
    data-[state=inactive]:bg-gray-200 data-[state=inactive]:text-gray-700'>
                        Assigned to you
                    </Tabs.Trigger>
                    <Tabs.Trigger value='reported' className='px-3 py-1 rounded transition
    data-[state=active]:bg-green-600 data-[state=active]:text-white
    data-[state=inactive]:bg-gray-400 data-[state=inactive]:text-gray-900'>
                        Reported by you
                    </Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value='assigned' className='w-full'>
                    <IssueGrid allIssues={assignedIssue?.slice(0, 4)} loading={loading}/>
                </Tabs.Content>
                <Tabs.Content value='reported' className='w-full'>
                    <IssueGrid allIssues={reportedIssue?.slice(0, 4)} loading={loading}/>
                </Tabs.Content>
            </Tabs.Root>
        </div>
    )
}

function IssueGrid({ allIssues, loading }) {
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
            {loading ? <BarLoader width={'100%'}/> :
                allIssues?.map(issue => (
                    <IssueCard issue={issue} key={issue?.id}/>
                ))
            }
        </div>
    )
}

export default IssueAcross