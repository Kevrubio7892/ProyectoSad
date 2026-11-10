import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Login from './Login';
import { getUserRoleByPhone } from '../firebaseConfig';
import { signInWithPhoneNumber } from 'firebase/auth';

const { mockGetUserRoleByPhone, mockSignInWithPhoneNumber, mockSignOut } = vi.hoisted(() => ({
  mockGetUserRoleByPhone: vi.fn(),
  mockSignInWithPhoneNumber: vi.fn(),
  mockSignOut: vi.fn(),
}));

vi.mock('@ionic/react', () => {
  const ReactModule = require('react');
  return {
    IonPage: ({ children }: React.PropsWithChildren) => ReactModule.createElement('div', null, children),
    IonContent: ({ children }: React.PropsWithChildren) => ReactModule.createElement('main', null, children),
    IonButton: ({ children, fill: _fill, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { fill?: string }) =>
      ReactModule.createElement('button', { type: 'button', ...props }, children),
    IonInput: ({ label, labelPlacement: _labelPlacement, value, onIonChange, ...props }: {
      label: string;
      labelPlacement?: string;
      value: string;
      onIonChange: (event: { detail: { value: string } }) => void;
    } & React.InputHTMLAttributes<HTMLInputElement>) =>
      ReactModule.createElement(
        'label',
        null,
        label,
        ReactModule.createElement('input', {
          ...props,
          value,
          onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
            onIonChange({ detail: { value: event.target.value } }),
        })
      ),
    IonText: ({ children, ...props }: React.PropsWithChildren) =>
      ReactModule.createElement('span', props, children),
    IonIcon: () => ReactModule.createElement('span'),
    IonImg: () => ReactModule.createElement('img'),
    IonLoading: () => null,
  };
});

vi.mock('ionicons/icons', () => ({
  logoGoogle: 'google',
  callOutline: 'phone',
}));

vi.mock('firebase/auth', () => ({
  RecaptchaVerifier: class {
    clear = vi.fn();
  },
  signInWithPhoneNumber: mockSignInWithPhoneNumber,
  signOut: mockSignOut,
}));

vi.mock('../firebaseConfig', () => ({
  auth: {},
  getUserRoleByPhone: mockGetUserRoleByPhone,
  getUserRoleFromCollections: vi.fn(),
  googleLogin: vi.fn(),
  loginUser: vi.fn(),
}));

describe('Login phone authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends an SMS code and routes a verified student to cards', async () => {
    const confirmation = {
      confirm: vi.fn().mockResolvedValue({
        user: { phoneNumber: '+56912345678' },
      }),
    };
    mockSignInWithPhoneNumber.mockResolvedValue(confirmation);
    mockGetUserRoleByPhone.mockResolvedValue('Estudiante');

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Route exact path="/login">
          <Login />
        </Route>
        <Route exact path="/tarjetas">
          <div>Tarjetas</div>
        </Route>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión con teléfono' }));
    fireEvent.change(screen.getByLabelText('Teléfono (formato internacional)'), {
      target: { value: '+56912345678' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar código SMS' }));

    await screen.findByLabelText('Código de verificación');
    expect(mockSignInWithPhoneNumber).toHaveBeenCalledWith(
      {},
      '+56912345678',
      expect.any(Object)
    );

    fireEvent.change(screen.getByLabelText('Código de verificación'), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Verificar código' }));

    await waitFor(() => {
      expect(screen.getByText('Tarjetas')).toBeInTheDocument();
    });
    expect(confirmation.confirm).toHaveBeenCalledWith('123456');
    expect(getUserRoleByPhone).toHaveBeenCalledWith('+56912345678');
  });

  it('rejects phone numbers that are not in international format', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Route path="/login">
          <Login />
        </Route>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión con teléfono' }));
    fireEvent.change(screen.getByLabelText('Teléfono (formato internacional)'), {
      target: { value: '912345678' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar código SMS' }));

    expect(await screen.findByText(/Ingresa el teléfono con código de país/)).toBeInTheDocument();
    expect(mockSignInWithPhoneNumber).not.toHaveBeenCalled();
  });

  it('starts guided onboarding when a verified phone has no student profile', async () => {
    const confirmation = {
      confirm: vi.fn().mockResolvedValue({
        user: { phoneNumber: '+56912345678' },
      }),
    };
    mockSignInWithPhoneNumber.mockResolvedValue(confirmation);
    mockGetUserRoleByPhone.mockResolvedValue(null);

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Route exact path="/login">
          <Login />
        </Route>
        <Route exact path="/register-form-phone">
          <div>Completa tu perfil telefónico</div>
        </Route>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión con teléfono' }));
    fireEvent.change(screen.getByLabelText('Teléfono (formato internacional)'), {
      target: { value: '+56912345678' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar código SMS' }));
    await screen.findByLabelText('Código de verificación');
    fireEvent.change(screen.getByLabelText('Código de verificación'), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Verificar código' }));

    expect(await screen.findByText('Completa tu perfil telefónico')).toBeInTheDocument();
    expect(mockSignOut).not.toHaveBeenCalled();
  });
});
