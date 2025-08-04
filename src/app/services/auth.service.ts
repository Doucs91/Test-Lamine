import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { User, Doctor, Patient, LoginCredentials, RegisterData } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Données de démonstration
  private mockUsers: (Doctor | Patient)[] = [
    {
      id: '1',
      email: 'dr.menard@vitamedicale.ca',
      firstName: 'Marie Chantal',
      lastName: 'Ménard',
      userType: 'doctor',
      phone: '+1 514 292-0801',
      isActive: true,
      createdAt: new Date('2023-01-15'),
      lastLogin: new Date(),
      specialization: 'Médecine générale',
      licenseNumber: 'MD-12345',
      department: 'Consultation générale',
      availableHours: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
    },
    {
      id: '2',
      email: 'patient@example.com',
      firstName: 'Jean',
      lastName: 'Dupont',
      userType: 'patient',
      phone: '+1 514 123-4567',
      isActive: true,
      createdAt: new Date('2023-06-10'),
      lastLogin: new Date(),
      dateOfBirth: new Date('1985-03-15'),
      address: '123 Rue de la Paix, Montréal, QC H3H 1A1',
      emergencyContact: {
        name: 'Marie Dupont',
        phone: '+1 514 987-6543',
        relationship: 'Épouse'
      },
      medicalHistory: ['Hypertension', 'Diabète type 2']
    }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Vérifier si l'utilisateur est déjà connecté (localStorage)
    this.checkAuthStatus();
  }

  login(credentials: LoginCredentials): Observable<{ success: boolean; user?: User; error?: string }> {
    return of(null).pipe(
      delay(1000), // Simulation d'appel API
      map(() => {
        const user = this.mockUsers.find(u => 
          u.email === credentials.email && 
          u.userType === credentials.userType
        );

        if (user) {
          // Simulation de vérification du mot de passe
          if (credentials.password === 'password123') {
            user.lastLogin = new Date();
            this.setCurrentUser(user);
            return { success: true, user };
          } else {
            return { success: false, error: 'Mot de passe incorrect' };
          }
        } else {
          return { success: false, error: 'Utilisateur non trouvé' };
        }
      })
    );
  }

  register(data: RegisterData): Observable<{ success: boolean; user?: User; error?: string }> {
    return of(null).pipe(
      delay(1500), // Simulation d'appel API
      map(() => {
        // Vérifier si l'email existe déjà
        const existingUser = this.mockUsers.find(u => u.email === data.email);
        if (existingUser) {
          return { success: false, error: 'Cet email est déjà utilisé' };
        }

        // Vérifier la confirmation du mot de passe
        if (data.password !== data.confirmPassword) {
          return { success: false, error: 'Les mots de passe ne correspondent pas' };
        }

        // Créer un nouvel utilisateur
        const newUser: User = {
          id: (this.mockUsers.length + 1).toString(),
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          userType: data.userType,
          phone: data.phone,
          isActive: true,
          createdAt: new Date(),
          lastLogin: new Date()
        };

        // Ajouter les champs spécifiques selon le type
        if (data.userType === 'doctor') {
          const doctor: Doctor = {
            ...newUser,
            userType: 'doctor',
            specialization: data.specialization || 'Médecine générale',
            licenseNumber: data.licenseNumber || '',
            department: 'Consultation générale',
            availableHours: ['09:00', '10:00', '11:00', '14:00', '15:00']
          };
          this.mockUsers.push(doctor);
          this.setCurrentUser(doctor);
          return { success: true, user: doctor };
        } else {
          const patient: Patient = {
            ...newUser,
            userType: 'patient',
            dateOfBirth: data.dateOfBirth || new Date(),
            address: data.address || '',
            emergencyContact: {
              name: '',
              phone: '',
              relationship: ''
            }
          };
          this.mockUsers.push(patient);
          this.setCurrentUser(patient);
          return { success: true, user: patient };
        }
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  isDoctor(): boolean {
    const user = this.getCurrentUser();
    return user?.userType === 'doctor';
  }

  isPatient(): boolean {
    const user = this.getCurrentUser();
    return user?.userType === 'patient';
  }

  private setCurrentUser(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  private checkAuthStatus(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }
    }
  }
}
