import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { FormGroup } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import * as _ from 'lodash';
import { User } from 'src/app/models/user';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';
@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css']
})
export class SignupComponent {
    public frm: FormGroup;
    public ctlPseudo: FormControl;
    public ctlFirstName: FormControl;
    public ctlLastName: FormControl;
    public ctlEmail: FormControl;
    public ctlPassword: FormControl;
    public ctlPasswordConfirm: FormControl;
    public ctlBirthDate: FormControl;
    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private router: Router,
        private authenticationService: AuthenticationService
    ) {
        this.ctlPseudo = this.fb.control('', [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(10),
            this.forbiddenValue('abc')
        ], [this.pseudoUsed()]);
        this.ctlFirstName = this.fb.control('', [
            Validators.minLength(3),
            Validators.maxLength(50)]);
        this.ctlLastName = this.fb.control('', [
            Validators.minLength(3),
            Validators.maxLength(50)]);
        this.ctlEmail = this.fb.control('', [
            Validators.required,
             this.validateEmail()
            ], [this.emailUsed()]);
        this.ctlPassword = this.fb.control('', [
            Validators.required, 
            Validators.minLength(3)]);
        this.ctlPasswordConfirm = this.fb.control('', [
            Validators.required, 
            this.mismatchPassword()]);
        this.ctlBirthDate = this.fb.control('', [this.validateBirthDate()]);
        this.frm = this.fb.group({
            pseudo: this.ctlPseudo,
            firstName: this.ctlFirstName,
            lastName: this.ctlLastName,
            email: this.ctlEmail,
            password: this.ctlPassword,
            passwordConfirm: this.ctlPasswordConfirm,
            birthDate: this.ctlBirthDate,
        });
        //this.frm.patchValue(data.user);
    }
    // Validateur bidon qui vérifie que la valeur est différente
    forbiddenValue(val: string): any {
        var  serchfind:boolean;
        var regexp = new RegExp(/[a-zA-Z][a-zA-Z_]*/);

        return (ctl: FormControl) => {
            if(ctl.pristine){
                return null
            }
            serchfind = regexp.test(ctl.value);
            return serchfind ? null : {invalidEmail : true};
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
    mismatchPassword(): any {
        return (ctl: FormControl) => {
            if(ctl.pristine){
                return null
            }
            if(ctl.value != null && ctl.value != this.ctlPassword.value){
                    return {mismatchPassword : true};
            }
            return null;
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
    AddUser() {
        var user = new User(this.frm.value);
        this.userService.add(user).subscribe(res => {
            if(res){
                this.authenticationService.login(user.pseudo, user.password).subscribe(
                    // si login est ok, on navigue vers la page demandée
                    data => {
                        this.router.navigate(["/"]);
                    },
                    // en cas d'erreurs, on reste sur la page et on les affiche
                    error => {
                        const errors = error.error.errors;
                        for (let field in errors) {
                            this.frm.get(field.toLowerCase()).setErrors({ custom: errors[field] })
                        }
                    });
            }
        });
        
    }
    cancel() {
        //this.dialogRef.close();
    }
}