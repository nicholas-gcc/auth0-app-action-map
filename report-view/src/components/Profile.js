import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

// Trigger component to render each trigger item
const Trigger = ({ trigger }) => (
    <li className="list-group-item">{trigger.id} - Version: {trigger.version}</li>
);
  
// Action component to render each action item with its associated triggers
const Action = ({ action }) => (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="card-title">{action.name}</h5>
        {/* Checking if triggers are viewable to user and rendering them */}
        {action.supported_triggers && action.supported_triggers.length > 0 && (
            <div>
                <p>Triggers</p>
                <ul className="list-group list-group-flush">
                {action.supported_triggers.map((trigger, i) => <Trigger key={i} trigger={trigger} />)}
                </ul>
            </div>
            )}

      </div>
    </div>
);

const Profile = () => {
    const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
    // State to hold the user token and report data
    const [userToken, setUserToken] = useState(null);
    const [reportData, setReportData] = useState(null);
    
    // useEffect to fetch the user token when the user is authenticated
    useEffect(() => {
        const getUserToken = async () => {
        const token = await getAccessTokenSilently({
            audience: process.env.REACT_APP_REPORT_API_AUDIENCE_DOMAIN,
        });
        setUserToken(token);
        };

        if (isAuthenticated) { // Fetch the token only if the user is authenticated
        getUserToken();
        }
    }, [isAuthenticated, getAccessTokenSilently]);

    // Fetch report data when userToken is set
    useEffect(() => {
        const fetchReportData = async () => {
        try {
            const response = await fetch(process.env.REACT_APP_API_URL, {
            headers: {
                Authorization: `Bearer ${userToken}`,  // Passing the user token in request headers
            },
            });
    
            if (!response.ok) {
            throw new Error("Network response was not ok");
            }
    
            const data = await response.json();
            setReportData(data);  // Setting the report data to state
        } catch (error) {
            console.error("There has been a problem with your fetch operation: ", error);
        }
        };
    
        if (userToken) {  // Fetch the report data only if the user token is available
        fetchReportData();
        }
    }, [userToken]);

    if (isLoading) {  // Render loading state
        return <div>Loading user data...</div>;
    }

    return (
        isAuthenticated && (
        <div className="container">
            <div className="row justify-content-center align-items-center">
            <div className="col-md-6">
                <div className="text-center">
                {/* Render user information and report data when user is authenticated */}
                <img src={user.picture} alt={user.name} className="rounded-circle img-thumbnail mb-3" />
                <h2>{user.name}</h2>
                <p>{user.email}</p>
                {reportData ? (
                    <div>
                    {/* Render each application and its associated actions */}
                    {Object.entries(reportData).map(([appName, data]) => (
                        <div key={appName}>
                        <h3>{appName}</h3>
                        <p>Actions</p>
                        {data.actions.map((action, i) => <Action key={i} action={action} />)}
                        </div>
                    ))}
                    </div>
                ) : (
                    <div>Loading app data...</div>
                )}
                </div>
            </div>
            </div>
        </div>
        )
    );
};

export default Profile;
