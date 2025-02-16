'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface IFamilyMember {
  name: string;
  email: string;
  dietaryRestrictions: string[];
  isAdult: boolean;
  isPrimaryContact: boolean;
}

interface FormErrors {
  email?: string;
  members?: {
    [key: number]: {
      name?: string;
      email?: string;
      dietaryRestrictions?: string;
    };
  };
  general?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FAMILY_MEMBERS = 4;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 100;

const FamilyRegistrationForm = () => {
  const [email, setEmail] = useState('');
  const [members, setMembers] = useState<IFamilyMember[]>([
    {
      name: '',
      email: '',
      dietaryRestrictions: [],
      isAdult: false,
      isPrimaryContact: false,
    },
  ]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const dietaryOptions = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Nut-Free',
    'Halal',
  ];

  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};

    // Validate primary email
    if (!email) {
      newErrors.email = 'Family email is required';
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate members
    if (members.length === 0) {
      newErrors.general = 'At least one family member is required';
    } else {
      newErrors.members = {};

      const usedEmails = new Set<string>();

      members.forEach((member, index) => {
        if (!newErrors.members![index]) newErrors.members![index] = {};

        // Validate name
        if (!member.name) {
          newErrors.members![index].name = 'Name is required';
        } else if (member.name.length < MIN_NAME_LENGTH) {
          newErrors.members![index].name =
            `Name must be at least ${MIN_NAME_LENGTH} characters`;
        } else if (member.name.length > MAX_NAME_LENGTH) {
          newErrors.members![index].name =
            `Name must not exceed ${MAX_NAME_LENGTH} characters`;
        }

        // Validate member email
        if (member.isAdult) {
          // Optional field but should be valid if provided
          if (!member.email) {
          } else if (!EMAIL_REGEX.test(member.email)) {
            newErrors.members![index].email =
              'Please enter a valid email address';
          } else if (usedEmails.has(member.email)) {
            newErrors.members![index].email = 'Email address must be unique';
          } else {
            usedEmails.add(member.email);
          }
        }
      });

      // Ensure at least one adult is registered
      if (!members.some((member) => member.isAdult)) {
        newErrors.general = 'At least one adult member is required';
      }
    }

    return newErrors;
  }, [email, members]);

  const handleAddMember = () => {
    if (members.length < MAX_FAMILY_MEMBERS) {
      setMembers([
        ...members,
        {
          name: '',
          email: '',
          dietaryRestrictions: [],
          isAdult: false,
          isPrimaryContact: false,
        },
      ]);
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.members?.[members.length];
        return newErrors;
      });
    }
  };

  const handleRemoveMember = (index: number) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (newErrors.members) {
          delete newErrors.members[index];
        }
        return newErrors;
      });
    }
  };

  const handleMemberChange = (
    index: number,
    field: keyof IFamilyMember,
    value: string | string[] | boolean
  ) => {
    const updatedMembers = members.map((member, i) => {
      if (i === index) {
        const updatedMember = { ...member, [field]: value };

        if (field === 'isAdult' && !value) {
          updatedMember.email = '';
        }

        return updatedMember;
      }
      return member;
    });
    setMembers(updatedMembers);

    setErrors((prev) => {
      const newErrors = { ...prev };
      if (
        newErrors.members?.[index]?.[
          field as keyof (typeof newErrors.members)[0]
        ]
      ) {
        delete newErrors.members[index][
          field as keyof (typeof newErrors.members)[0]
        ];
      }
      return newErrors;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsSubmitting(false);
      return;
    }

    // API request to register family
  };

  return (
    <div className="mx-auto w-full max-w-3xl p-4">
      <Card>
        <CardHeader>
          <CardTitle>Family Registration</CardTitle>
        </CardHeader>
        <CardContent>
          {submitSuccess && (
            <Alert className="mb-4 bg-green-50">
              <AlertDescription>
                Family registration successful!
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Primary Family Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className={`w-full rounded-md border p-2 ${
                  errors.email ? 'border-red-500' : ''
                }`}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {members.map((member, index) => (
              <div key={index} className="space-y-4 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    Family Member {index + 1}
                  </h3>
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(index)}
                      className="text-red-600 hover:text-red-800"
                      disabled={isSubmitting}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Name</label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) =>
                      handleMemberChange(index, 'name', e.target.value)
                    }
                    className={`w-full rounded-md border p-2 ${
                      errors.members?.[index]?.name ? 'border-red-500' : ''
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.members?.[index]?.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.members[index].name}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={member.isAdult}
                    onChange={(e) =>
                      handleMemberChange(index, 'isAdult', e.target.checked)
                    }
                    className="rounded"
                    disabled={isSubmitting}
                  />
                  <label className="text-sm font-medium">Adult (18+)</label>
                </div>

                {member.isAdult && (
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={member.email}
                      onChange={(e) =>
                        handleMemberChange(index, 'email', e.target.value)
                      }
                      className={`w-full rounded-md border p-2 ${
                        errors.members?.[index]?.email ? 'border-red-500' : ''
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.members?.[index]?.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.members[index].email}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Dietary Restrictions
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {dietaryOptions.map((restriction) => (
                      <label
                        key={restriction}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={member.dietaryRestrictions.includes(
                            restriction
                          )}
                          onChange={(e) => {
                            const newRestrictions = e.target.checked
                              ? [...member.dietaryRestrictions, restriction]
                              : member.dietaryRestrictions.filter(
                                  (r) => r !== restriction
                                );
                            handleMemberChange(
                              index,
                              'dietaryRestrictions',
                              newRestrictions
                            );
                          }}
                          className="rounded"
                          disabled={isSubmitting}
                        />
                        <span className="text-sm">{restriction}</span>
                      </label>
                    ))}
                  </div>
                  {errors.members?.[index]?.dietaryRestrictions && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.members[index].dietaryRestrictions}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {members.length < MAX_FAMILY_MEMBERS && (
              <button
                type="button"
                onClick={handleAddMember}
                className="w-full rounded-md border border-blue-500 px-4 py-2 text-blue-500 hover:bg-blue-50 disabled:opacity-50"
                disabled={isSubmitting}
              >
                Add Family Member
              </button>
            )}

            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering...' : 'Register Family'}
            </button>
          </form>

          {errors.general && (
            <Alert className="mt-4 bg-red-50">
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FamilyRegistrationForm;
