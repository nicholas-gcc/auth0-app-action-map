# auth0-app-action-map

## About

This project provides a solution to dynamically generate and view a report of all Auth0 applications in your tenant, and their associated Actions. This solution also utilises Role-Based Access Control (RBAC) to control which portions of the report can be viewed based on permissions - in particular, for users with the 'Manager' role assigned through RBAC, this report also includes the type of trigger each Action is bound to.

## Project Structure

- `report-view`: This is a React application that communicates with the backend servers and Auth0 Login Providers to enable authentication and display the report. It runs on `localhost:5001`.
  
- `api-gateway`: Running on `localhost:3000`, it serves as the proxy and entry point for backend services.
  
- `report-generation-service`: A backend service running on `localhost:3001` that fetches data from Auth0's Management API and prepares the report.
  
- Behind the scenes on the Auth0 Dashboard, there are two Auth0 applications integrated with the frontend and backend respectively: `report-view-spa` and `report-generation-service`.
  
- On the Auth0 dashboard, we have also defined two APIs - `Report Generation Service API` which acts as the `audience` for the frontend login providers and is responsible for verifying authentication token before interacting with the `Management API`, and the `Management API` which allows for interaction with Auth0 admin data (like client apps and actions)
  
- The Auth0 application `report-generation-service` uses both the `Report Generation Service API` and the `Management API`


## Usage

### Prerequisites
- Auth0 account and tenant configured
  
- On `Auth0 Dashboard > Applications`, configure a `Regular Web Application` for the `report-generation-service`. It is not necessary to set any Callback URLs or Allowed Web Origins
  
- On `Auth0 Dashboard > Applications`, configure a `Single Page Application` for the `report-view-spa`. Set `Allowed Web Origins` and `Allowed Callback URLs` to `localhost:5001` or any port number you choose
  
- On `Auth0 Dashboard > APIs`, configure a `Custom API` for the `Report Generation Service API`, setting your own unique URL identifier and the Signing Algorithm to `RS256`. Also verify that the `Auth0 Management API` is present on the APIs page.

- On `Auth0 Dashboard > User Management > Roles`, configure a `Manager` role

- Have [npm](https://www.npmjs.com) and [Node.js](https://nodejs.dev/en/) on your machine
  
- Have [Docker](https://www.docker.com) installed

### Setup (with Docker)

1. Clone the repository to your local machine.
```
git clone https://github.com/nicholas-gcc/auth0-app-action-map.git
```
2. Create a `.env` file following the format specified in the [`/report-view/.env.example`](https://github.com/nicholas-gcc/auth0-app-action-map/blob/main/report-view/.env.example), [`/report-generation-service/.env.example`](https://github.com/nicholas-gcc/auth0-app-action-map/blob/main/report-generation-service/.env.example) and [`/api-gateway/.env.example`](https://github.com/nicholas-gcc/auth0-app-action-map/blob/main/api-gateway/.env.example) directories
3. From the root directory, deploy and run the Docker container using:
```
docker-compose up --build
```
You can now access the system at `localhost:5001`. You can click the `Login` button and log in with your Auth0 credentials associated with the desired tenant to generate the report.

### Setup (on localhost)

1. Clone the repository to your local machine.
```
git clone https://github.com/nicholas-gcc/auth0-app-action-map.git
```
2. Create a `.env` file following the format specified in the [`/report-view/.env.example`](https://github.com/nicholas-gcc/auth0-app-action-map/blob/main/report-view/.env.example), [`/report-generation-service/.env.example`](https://github.com/nicholas-gcc/auth0-app-action-map/blob/main/report-generation-service/.env.example) and [`/api-gateway/.env.example`](https://github.com/nicholas-gcc/auth0-app-action-map/blob/main/api-gateway/.env.example) directories
3. Install the required npm packages for the frontend and backend and run each service.
```
cd report-view
npm install
npm start
```
```
cd api-gateway
npm install
npm start
```
```
cd report-generation-service
npm install
npm start
```
You can now access the system at `localhost:5001`. You can click the `Login` button and log in with your Auth0 credentials associated with the desired tenant to generate the report.

## Application Flow
- The React frontend integrates with an Auth0 provider, enabling users to log in with Auth0's predefined login boxes (shown below)


![image](https://github.com/nicholas-gcc/auth0-app-action-map/assets/69677864/5a1be863-461d-4ae6-a072-0b935af88618)

  
- Upon successful login, Auth0 generates a bearer token for the session which is then sent to the `api-gateway` and the `report-generation-service`. Both of these services have authentication middlewares with the intended audience being the `Report Generation Service API`, but you may choose to define different authentication logic at the `api-gateway` (e.g. Coarse Permissions) and the `report-generation-service` levels (e.g. Fine-Grained Permissions) separately according to your business rules and logic

- After successful authentication, the `report-generation-service` uses the `Management API` to generate a Management API token. This token is used to retrieve information about client applications, actions, and flows. In particular, this application uses the `Management API`'s `/api/v2/clients` and `/api/v2/actions/actions` endpoints to generate the action-client mappings, and the `/api/v2/users/{userId}/roles` to verify the permissions assigned to the user.

- It also checks if the user is assigned a `Manager` role. If so, the report will display all information, including triggers. Below is an example of a user with the `Manager` role.

  
![image](https://github.com/nicholas-gcc/auth0-app-action-map/assets/69677864/c2ff9088-edf2-4d11-8587-d5238e8e7e54)

- Otherwise if the logged in user does not have the `Manager` role, the triggers will not be displayed as shown below:


![image](https://github.com/nicholas-gcc/auth0-app-action-map/assets/69677864/6c43ab1e-3d23-4200-b5f0-5863a55b07e4)

## Possible Feature Extensions

This application is structured with potential extension of microservice APIs in mind, regardless of tech stack. Adding new services and integrations can be made possible by defining a new API separate from the `report_generation_service`, proxying these new services through the `api-gateway`, configuring a `Dockerfile` and modifying `docker-compose.yml` to cater for different service infrastructure. This enables the extension of the application while also maintaining Separation of Concerns.

- **Action Usage Statistics**: This would provide a statistical breakdown of how often each Action is executed. It could be helpful for management to optimize resources by identifying underutilized Actions. You can possibly do this by accessing logs through the Management API using the `/api/v2/logs` endpoint and defining a separate API service for this.
  
- **Integration with Other Services**: Depending on the specific needs of your company or your customers, you could add features to integrate Auth0 with other services. For instance, you could connect it with Slack or email to send notifications about critical events or updates, such as new mappings between Actions and client applications, utilising webhooks between this app and the service you are looking to integrate
  
- **Advanced Search**: Improve the search functionality in the application. Allow users to search for Actions based on different criteria, such as trigger type, name, date created, and more. This could greatly simplify the process of finding the right Actions. This can be achieved by provisioning a database or in-memory data structures, populating them with your tenant data and retrieving relevant results based on user inputs and use built-in search/query methods on the programming language of your choice

- **Rate Limiting**: In the `api-gateway`, you can introduce rate limiting to prevent abuse and to protect your backend services. Rate limiting can be IP-based, or user-based if the user is authenticated at the API gateway.

- **Conditional Access Policies**: In the `report_generation_service`, you can implement conditional access policies that take into account the user's location, device, IP address, etc. For example, requests from unfamiliar locations or devices might trigger additional security measures.

## Deployment Considerations and Alternatives

While Docker provides a flexible and robust solution for deploying the `auth0-app-action-map` project, it may be worth considering AWS Lambda as a potential alternative, depending on your specific use case:

- **Scalability**: If the `auth0-app-action-map` is expected to be used infrequently or irregularly (such as an administrative tool used for periodic audits or reports), AWS Lambda's pay-per-use model could provide cost benefits. You would only be billed for the actual compute time consumed by each function invocation, instead of paying for server uptime on Docker

- **Ease of Management**: AWS Lambda abstracts away infrastructure management, allowing you to focus solely on code. This might simplify operations if your team doesn't have extensive DevOps expertise or if you prefer to minimize operational overhead.

- **Integration with AWS Ecosystem**: If your infrastructure is heavily AWS-based, AWS Lambda integrates seamlessly with other AWS services for a smooth, end-to-end development and deployment experience.









