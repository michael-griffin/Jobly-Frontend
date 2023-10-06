import './App.css';
import { useEffect, useState } from "react";
import { BrowserRouter } from 'react-router-dom'; //Navigate
import RoutesList from './RoutesList';
import Nav from './Nav';
import userContext from "./userContext";
import JoblyApi from './api';
import jwt_decode from "jwt-decode";
import Loading from './Loading';


//Profile form: form itself basically unchanged, added a few things to app/api
// App: updated user now sets User State (as we'd expect)
// api: updateUser method now accepts both user AND username
//    (wasn't grabbing user properly, hence authorization error)

// Notes on context:
//  - Want to use user context primarily in jobCard component.
//  For profile update form, nav and homepage, we can pass directly as prop.



/** App: Job app. Allows user to sign in and view jobs and companies
 *    including options for user to search for jobs by company or by job title.
 * Displays Nav bar and routes list.
 *
 * Props: None
 *
 * State:
 *  - User: The current logged in user, if any
 *  - Token: Issued from backend, used for authorization
 *
 */
function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoaded, setIsLoaded] = useState(false);

  /** Updates token and sets within local storage (removes if not available) */
  function updateToken(token) {
    // console.log("token", token);

    setToken(token);
    (token) ?
      localStorage.setItem("token", token) :
      localStorage.removeItem("token");
  }

  async function login(formData) {
    const token = await JoblyApi.loginUser(formData);
    updateToken(token);
  }

  async function signup(formData) {
    const token = await JoblyApi.registerUser(formData);
    updateToken(token);
  }

  async function update(formData) {
    JoblyApi.token = token;
    const newUser = await JoblyApi.updateUser(user.username, formData);
    setUser(newUser);
  }

  function logout() {
    setUser(null);
    updateToken(null);
  }

  // TODO:
  async function apply(username, jobId) {
  return await JoblyApi.applyToJob(username, jobId);
  }


  /** Checks state for a token, if token exists set token in Jobly API
   *    and set user state if token exists. */
  useEffect(function getUserData() {
    async function fetchUserData() {
      if (token) {
        try { // Using try/catch block here to check for bad existing token from local storage
          JoblyApi.token = token;
          const decoded = jwt_decode(token);
          const userData = await JoblyApi.getUserInfo(decoded.username);
          setUser(userData.user);
        } catch(err) {
          console.error(err);
        }
      }
      setIsLoaded(true);

    }
    fetchUserData();
  }, [token]);


  return (
    <div className="App">
      {isLoaded ?
            <userContext.Provider value={{ user, token, apply }}>
            <BrowserRouter>
              <Nav user={user} logout={logout} />
              <RoutesList user={user} login={login} signup={signup} update={update}/>
            </BrowserRouter>
          </userContext.Provider>
      :
      <Loading />
      }
    </div>
  );
}

export default App;
