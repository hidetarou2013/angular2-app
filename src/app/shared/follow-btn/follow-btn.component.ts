import {
  Component,
  OnChanges,
  EventEmitter,
  Output,
  Input,
  SimpleChanges
} from "@angular/core";
import {FollowBtnService} from "./follow-btn.service";
import {UserService} from "../../core/services/user.service";
import {HttpErrorHandler} from "../../core/services/http-error-handler";
import {User} from "../../core/domains";
import {AuthService} from "../../core/services/auth.service";

@Component({
  selector: 'mpt-follow-btn',
  templateUrl: './follow-btn.component.html',
})
export class FollowBtnComponent implements OnChanges {

  @Input() followerId: string;
  @Output() updated = new EventEmitter();

  canShowFollowBtn: boolean;
  canShowUnfollowBtn: boolean;
  busy: boolean = false;

  constructor(private followBtnService: FollowBtnService,
              private userService: UserService,
              private authService: AuthService,
              private errorHandler: HttpErrorHandler) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.followerId) {
      this.loadCurrentStatus();
    }
  }

  follow() {
    this.busy = true;
    this.followBtnService.follow(this.followerId)
      .finally(() => this.busy = false)
      .subscribe(() => {
        this.canShowFollowBtn = !this.canShowFollowBtn;
        this.canShowUnfollowBtn = !this.canShowUnfollowBtn;
        this.updated.emit({});
      }, e => this.errorHandler.handle(e))
    ;
  }

  unfollow() {
    this.busy = true;
    this.followBtnService.unfollow(this.followerId)
      .finally(() => this.busy = false)
      .subscribe(() => {
        this.canShowFollowBtn = !this.canShowFollowBtn;
        this.canShowUnfollowBtn = !this.canShowUnfollowBtn;
        this.updated.emit({});
      }, e => this.errorHandler.handle(e))
    ;
  }

  loadCurrentStatus(): void {
    this.busy = true;
    this.userService.get(this.followerId)
      .finally(() => this.busy = false)
      .subscribe(user => {
        this.canShowFollowBtn = this._canShowFollowBtn(user);
        this.canShowUnfollowBtn = this._canShowUnfollowBtn(user);
      }, e => this.errorHandler.handle(e))
    ;
  }

  private _canShowFollowBtn(user: User): boolean {
    if (this.authService.isMyself(user) === null) return false; // not signed in
    if (this.authService.isMyself(user) === true) return false; // myself
    if (user.isFollowedByMe === true) return false; // already followed
    return true;
  }

  private _canShowUnfollowBtn(user: User): boolean {
    if (this.authService.isMyself(user) === null) return false; // not signed in
    if (this.authService.isMyself(user) === true) return false; // myself
    if (user.isFollowedByMe === false) return false; // not followed yet
    return true;
  }
}
