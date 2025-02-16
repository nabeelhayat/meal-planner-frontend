'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IFamilyMember, FormErrors } from '@/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FAMILY_MEMBERS = 4;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 100;

const FamilyRegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [familyName, setFamilyName] = useState('');
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

  const validateBasicInfo = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!familyName) {
      newErrors.familyName = 'Family name is required';
    } else if (familyName.length < MIN_NAME_LENGTH) {
      newErrors.familyName = `Family name must be at least ${MIN_NAME_LENGTH} characters`;
    } else if (familyName.length > MAX_NAME_LENGTH) {
      newErrors.familyName = `Family name must not exceed ${MAX_NAME_LENGTH} characters`;
    }

    if (!email) {
      newErrors.email = 'Family email is required';
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    return newErrors;
  };

  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {
      ...validateBasicInfo(),
    };

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
          if (!member.email) {
            // Optional field but should be valid if provided
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
  }, [familyName, email, members]);

  const handleNextStep = () => {
    const basicInfoErrors = validateBasicInfo();
    if (Object.keys(basicInfoErrors).length === 0) {
      setCurrentStep(1);
      setErrors({});
    } else {
      setErrors(basicInfoErrors);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(0);
    setErrors({});
  };

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

  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium">Name</label>
        <input
          type="text"
          value={familyName}
          onChange={(e) => {
            setFamilyName(e.target.value);
            setErrors((prev) => ({ ...prev, familyName: undefined }));
          }}
          className={`w-full rounded-md border p-2 ${
            errors.familyName ? 'border-red-500' : ''
          }`}
          disabled={isSubmitting}
        />
        {errors.familyName && (
          <p className="mt-1 text-sm text-red-600">{errors.familyName}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Email</label>
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

      <button
        type="button"
        onClick={handleNextStep}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        disabled={isSubmitting}
      >
        Next: Add Family Members
      </button>
    </div>
  );

  const renderMembersStep = () => (
    <div className="space-y-6">
      {members.map((member, index) => (
        <div key={index} className="space-y-4 rounded-md border p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Family Member {index + 1}</h3>
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
                    checked={member.dietaryRestrictions.includes(restriction)}
                    onChange={(e) => {
                      const newRestrictions = e.target.checked
                        ? [...member.dietaryRestrictions, restriction]
                        : member.dietaryRestrictions.filter(
                            (r: string) => r !== restriction
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

      <div className="flex gap-4">
        <button
          type="button"
          onClick={handlePreviousStep}
          className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          disabled={isSubmitting}
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Registering...' : 'Register Family'}
        </button>
      </div>
    </div>
  );

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
            {currentStep === 0 ? renderBasicInfoStep() : renderMembersStep()}
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
