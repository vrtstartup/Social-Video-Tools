import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { UserService } from '../../../common/services/user.service';

@Component({
  selector: 'projects',
  templateUrl: './projects.component.html',
})

export class ProjectsComponent implements OnInit {

  userId: string;
  userEmail: string;
  userRole: number;
  userSubscribtion: any;

  af: AngularFire;
  projectsRef: FirebaseListObservable<any[]>;

  constructor(
    af: AngularFire,
    public router: Router,
    public userService: UserService) {
    this.af = af;
    this.projectsRef = af.database.list('/projects');
  }

  ngOnInit() {
    this.userSubscribtion = this.userService.user$.subscribe(
      userData => {
        this.userId = userData.userID; this.userEmail = userData.email; this.userRole = userData.role;
      },
      err => console.log('authserviceErr', err)
    );
  }

  ngOnDestroy() {
    this.userSubscribtion.unsubscribe();
  }

  createNewProject($event) {
    // create new empty project
    this.projectsRef.push({ user: this.userId, created: Date.now(), createdBy: this.userEmail })
      .then((ref) => {
        // attach project id to user 
        this.af.database.object(`/users/${this.userId}/projects/${ref.key}`).set(true);
        this.router.navigateByUrl(`/projects/${ref.key}`);
      })
      .catch(err => console.log(err, 'could not create|upload a new project'));
  }
}