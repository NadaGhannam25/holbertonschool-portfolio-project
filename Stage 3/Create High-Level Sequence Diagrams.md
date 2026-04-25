1. Login Sequence Diagram

This sequence diagram illustrates the login process in the system. The process begins when the user submits their email and password through a login request to the API. The API then calls the Business Logic layer to validate the user data, while the Business Logic queries the database using the provided email address. If the credentials are valid, the password is verified, a JWT token is generated, and returned to the API. The user then receives a 200 OK response along with the token. If the credentials are invalid, the system returns a 401 Unauthorized response. The diagram clearly represents both the successful authentication flow and the failure scenario.

