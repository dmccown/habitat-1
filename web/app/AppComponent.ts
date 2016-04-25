// Copyright:: Copyright (c) 2015-2016 The Habitat Maintainers
//
// The terms of the Evaluation Agreement (Habitat) between Chef Software Inc.
// and the party accessing this file ("Licensee") apply to Licensee's use of
// the Software until such time that the Software is made available under an
// open source license such as the Apache 2.0 License.

import {AppStore} from "./AppStore";
import {Component, OnInit} from "angular2/core";
import {ExplorePageComponent} from "./explore-page/ExplorePageComponent";
import {HeaderComponent} from "./header/HeaderComponent";
import {NotificationsComponent} from "./notifications/NotificationsComponent";
import {OriginCreatePageComponent} from "./origin-create-page/OriginCreatePageComponent";
import {OriginsPageComponent} from "./origins-page/OriginsPageComponent";
import {OrganizationCreatePageComponent} from "./organization-create-page/OrganizationCreatePageComponent";
import {OrganizationsPageComponent} from "./organizations-page/OrganizationsPageComponent";
import {PackagePageComponent} from "./package-page/PackagePageComponent";
import {PackagesPageComponent} from "./packages-page/PackagesPageComponent";
import {ProjectCreatePageComponent} from "./project-create-page/ProjectCreatePageComponent";
import {ProjectPageComponent} from "./project-page/ProjectPageComponent";
import {ProjectsPageComponent} from "./projects-page/ProjectsPageComponent";
import {RouteConfig, Router, RouterOutlet} from "angular2/router";
import {SCMReposPageComponent} from "./scm-repos-page/SCMReposPageComponent";
import {SideNavComponent} from "./side-nav/SideNavComponent";
import {SignInPageComponent} from "./sign-in-page/SignInPageComponent";
import {authenticateWithGitHub, fetchMyOrigins, loadSessionState,
    removeNotification, routeChange, setCurrentOrigin, signOut,
    toggleOriginPicker, toggleUserNavMenu} from "./actions/index";

@Component({
    directives: [HeaderComponent, NotificationsComponent, RouterOutlet, SideNavComponent],
    selector: "hab",
    template: `
    <div class="hab-topbar">
        <hab-notifications [notifications]="state.notifications.all"
                           [removeNotification]="removeNotification">
        </hab-notifications>
        <hab-header [appName]="state.app.name"
                    [isUserNavOpen]="user.isUserNavOpen"
                    [isSignedIn]="user.isSignedIn"
                    [username]="user.username"
                    [avatarUrl]="user.gitHub.get('avatar_url')"
                    [signOut]="signOut"
                    [toggleUserNavMenu]="toggleUserNavMenu"></hab-header>
    </div>
    <div class="hab-container">
        <hab-side-nav [fetchMyOrigins]="fetchMyOrigins"
                      [isOriginPickerOpen]="state.origins.ui.isPickerOpen"
                      [isSignedIn]="user.isSignedIn"
                      [myOrigins]="state.origins.mine"
                      [origin]="origin"
                      [route]="state.router.route"
                      [setCurrentOrigin]="setCurrentOrigin"
                      [toggleOriginPicker]="toggleOriginPicker"
                      *ngIf="!hideNav">
        </hab-side-nav>
        <section class="hab-main" [ngClass]="{centered: hideNav}">
            <router-outlet></router-outlet>
        </section>
        <footer class="hab-footer">
            <p>&copy; {{state.app.currentYear}} Chef Software, Inc. All Rights Reserved.</p>
        </footer>
    </div>`,
})

@RouteConfig([
    {
        path: "/",
        redirectTo: ["Packages"],
    },
    {
        path: "/explore",
        name: "Explore",
        component: ExplorePageComponent
    },
    {
        path: "/origins",
        name: "Origins",
        component: OriginsPageComponent,
    },
    {
        path: "/origins/create",
        name: "OriginCreate",
        component: OriginCreatePageComponent,
    },
    {
        path: "/orgs",
        name: "Organizations",
        component: OrganizationsPageComponent,
    },
    {
        path: "/orgs/create",
        name: "OrganizationCreate",
        component: OrganizationCreatePageComponent,
    },
    {
        path: "/pkgs",
        name: "Packages",
        component: PackagesPageComponent
    },
    {
        path: "/pkgs/*/:name",
        name: "PackagesForName",
        component: PackagesPageComponent
    },
    {
        path: "/pkgs/:origin",
        name: "PackagesForOrigin",
        component: PackagesPageComponent
    },
    {
        path: "/pkgs/:origin/:name",
        name: "PackagesForOriginAndName",
        component: PackagesPageComponent,
    },
    {
        path: "/pkgs/:origin/:name/:version",
        name: "PackagesForOriginAndNameAndVersion",
        component: PackagesPageComponent,
    },
    {
        path: "/pkgs/:origin/:name/:version/:release",
        name: "Package",
        component: PackagePageComponent
    },
    {
        path: "/projects",
        name: "Projects",
        component: ProjectsPageComponent
    },
    {
        path: "/projects/create",
        name: "ProjectCreate",
        component: ProjectCreatePageComponent
    },
    {
        path: "/projects/:origin/:name",
        name: "Project",
        component: ProjectPageComponent
    },
    {
        path: "/scm-repos",
        name: "SCMRepos",
        component: SCMReposPageComponent,
    },
    {
        path: "/sign-in",
        name: "SignIn",
        component: SignInPageComponent
    },
])

export class AppComponent implements OnInit {
    fetchMyOrigins: Function;
    removeNotification: Function;
    setCurrentOrigin: Function;
    signOut: Function;
    toggleOriginPicker: Function;
    toggleUserNavMenu: Function;

    constructor(private router: Router, private store: AppStore) {
        // Whenever the Angular route has an event, dispatch an event with the new
        // route data.
        router.subscribe(value => store.dispatch(routeChange(value)));

        // Check the route path for pages that exclude side nav
        router.subscribe(url => {
          this.hideNav = false;

          if (url.indexOf("sign-in") > -1) {
            this.hideNav = true;
          };

        });

        // Listen for changes on the state.
        store.subscribe(state => {
            // If the state has a requestedRoute attribute, use the router to navigate
            // to the route that was requested.
            const requestedRoute = state.router.requestedRoute;
            if (requestedRoute) { router.navigate(requestedRoute); }
        });

        this.fetchMyOrigins = function() {
            this.store.dispatch(fetchMyOrigins());
            return false;
        }.bind(this);

        this.removeNotification = function(i) {
            this.store.dispatch(removeNotification(i));
            return false;
        }.bind(this);

        this.setCurrentOrigin = function (origin) {
            this.store.dispatch(setCurrentOrigin(origin));
            return false;
        }.bind(this);

        this.signOut = function() {
            this.store.dispatch(signOut());
            return false;
        }.bind(this);

        this.toggleOriginPicker = function() {
            this.store.dispatch(toggleOriginPicker());
            return false;
        }.bind(this);

        this.toggleUserNavMenu = function() {
            this.store.dispatch(toggleUserNavMenu());
            return false;
        }.bind(this);

    }

    get origin() { return this.state.origins.current; }

    get state() { return this.store.getState(); }

    get user() { return this.state.users.current; }

    ngOnInit() {
        // Load up the session state from sessionStorage when we load the page
        this.store.dispatch(loadSessionState(sessionStorage));

        // When the page loads attempt to authenticate with GitHub. If there
        // is no token stored in session storage, this won't do anything.
        this.store.dispatch(
            authenticateWithGitHub(this.state.gitHub.authToken)
        );
    }
}
