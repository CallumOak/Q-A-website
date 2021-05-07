import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { FormGroup } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import * as _ from 'lodash';
import { User, Role } from 'src/app/models/user';
@Component({
    selector: 'app-edit-user-mat',
    templateUrl: './edit-user.component.html',
    styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent {
    public frm: FormGroup;
    public ctlPseudo: FormControl;
    public ctlEmail: FormControl;
    public ctlLastName: FormControl;
    public ctlFirstName: FormControl;
    public ctlPassword: FormControl;
    public ctlBirthDate: FormControl;
    public ctlRole: FormControl;
    public ctlReputation: FormControl;
    public isNew: boolean;
    constructor(public dialogRef: MatDialogRef<EditUserComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { user: User; isNew: boolean; },
        private fb: FormBuilder,
        private userService: UserService
    ) {
        this.isNew = data.isNew;
        this.ctlPseudo = this.fb.control('', [
            Validators.required,
            Validators.minLength(3),
            this.forbiddenValue('abc')
        ], [this.pseudoUsed()]);
        this.ctlEmail = this.fb.control('', [
            Validators.required,
            this.validateEmail()],
            [this.emailUsed()]);
        this.ctlLastName = this.fb.control('', [
            Validators.minLength(3),
            Validators.maxLength(50)]);
        this.ctlFirstName = this.fb.control('', [
            Validators.minLength(3),
            Validators.maxLength(50)]);
        this.ctlPassword = this.fb.control('', !this.isNew ?
        [Validators.minLength(3)] :
        [
            Validators.required, 
            Validators.minLength(3)]);
            this.ctlBirthDate = this.fb.control('', [this.validateBirthDate()]);
        this.ctlRole = this.fb.control(Role.Member, []);
        this.ctlReputation = this.fb.control(0, [
            Validators.min(0)]);
        this.frm = this.fb.group({
            pseudo: this.ctlPseudo,
            email: this.ctlEmail,
            lastName: this.ctlLastName,
            firstName: this.ctlFirstName,
            password: this.ctlPassword,
            birthDate: this.ctlBirthDate,
            role: this.ctlRole,
            reputation: this.ctlReputation
        });
        this.frm.patchValue(data.user);
        this.ctlPassword.setValue('');
    }
    // Validateur bidon qui vérifie que la valeur est différente
    forbiddenValue(val: string): any {
        return (ctl: FormControl) => {
            if (ctl.value === val) {
                return { forbiddenValue: { currentValue: ctl.value, forbiddenValue: val } };
            }
            return null;
        };
    }
    validateBirthDate(): any {
        return (ctl: FormControl) => {
            const date = new Date(ctl.value);
            const diff = Date.now() - date.getTime();
            if (diff < 0)
                return { futureBorn: true } 
            var age = new Date(diff).getUTCFullYear() - 1970;
            if (age < 18) 
                return { tooYoung: true };
            return null;
        };
    }
    // Validateur asynchrone qui vérifie si le pseudo n'est pas déjà utilisé par un autre membre
    pseudoUsed(): any {
        let timeout: NodeJS.Timer;
        return (ctl: FormControl) => {
            clearTimeout(timeout);
            const pseudo = ctl.value;
            return new Promise(resolve => {
                timeout = setTimeout(() => {
                    if (ctl.pristine) {
                        resolve(null);
                    } else {
                        this.userService.getByPseudo(pseudo).subscribe(user => {
                            resolve(user ? { pseudoUsed: true } : null);
                        });
                    }
                }, 300);
            });
        };
    }

    validateEmail(): any {
        var  serchfind:boolean;
        var regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

        return (ctl: FormControl) => {
            if(ctl.pristine){
                return null
            }
            serchfind = regexp.test(ctl.value);
            return serchfind ? null : {invalidEmail : true};
        };
    }

    emailUsed(): any {
        let timeout: NodeJS.Timer;
        return (ctl: FormControl) => {
            clearTimeout(timeout);
            const email = ctl.value;
            return new Promise(resolve => {
                timeout = setTimeout(() => {
                    if (ctl.pristine) {
                        resolve(null);
                    } else {
                        this.userService.getByEmail(email).subscribe(user => {
                            resolve(user ? { emailUsed: true } : null);
                        });
                    }
                }, 300);
            });
        };
    }
    onNoClick(): void {
        this.dialogRef.close();
    }
    update() {
        if (this.ctlPassword.value == "")
            this.ctlPassword.setValue(null);
        this.ctlReputation.setValue(Number(this.ctlReputation.value));
        this.dialogRef.close(this.frm.value);
    }
    cancel() {
        this.dialogRef.close();
    }
}
