'use client';

import React, { useState } from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormValues, IFamilyMember } from '@/types';
import { MAX_FAMILY_MEMBERS } from '@/constants/registration';
import { familyRegistrationSchema } from '@/validations/registration/schemas';

const FamilyRegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const dietaryOptions = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Nut-Free',
    'Halal',
  ];

  const initialValues: FormValues = {
    familyName: '',
    email: '',
    members: [
      {
        name: '',
        email: '',
        dietaryRestrictions: [],
        isAdult: false,
        isPrimaryContact: false,
      },
    ],
  };

  const handleSubmit = async (values: FormValues, { setSubmitting }: any) => {
    try {
      // API request to register family
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderBasicInfoStep = ({ errors, touched, isSubmitting }: any) => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="familyName">Name</Label>
        <Field
          as={Input}
          id="familyName"
          name="familyName"
          type="text"
          className={
            errors.familyName && touched.familyName ? 'border-red-500' : ''
          }
          disabled={isSubmitting}
        />
        {errors.familyName && touched.familyName && (
          <p className="text-sm text-red-600">{errors.familyName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Field
          as={Input}
          id="email"
          name="email"
          type="email"
          className={errors.email && touched.email ? 'border-red-500' : ''}
          disabled={isSubmitting}
        />
        {errors.email && touched.email && (
          <p className="text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <Button
        type="button"
        onClick={() => setCurrentStep(1)}
        className="w-full"
        disabled={isSubmitting || Object.keys(errors).length > 0}
      >
        Next: Add Family Members
      </Button>
    </div>
  );

  const renderMembersStep = ({
    values,
    errors,
    touched,
    isSubmitting,
  }: any) => (
    <FieldArray
      name="members"
      render={(arrayHelpers) => (
        <div className="space-y-6">
          {values.members.map((member: IFamilyMember, index: number) => (
            <div key={index} className="space-y-4 rounded-md border p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  Family Member {index + 1}
                </h3>
                {values.members.length > 1 && (
                  <Button
                    variant="destructive"
                    onClick={() => arrayHelpers.remove(index)}
                    disabled={isSubmitting}
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`members.${index}.name`}>Name</Label>
                <Field
                  as={Input}
                  id={`members.${index}.name`}
                  name={`members.${index}.name`}
                  className={
                    errors.members?.[index]?.name &&
                    touched.members?.[index]?.name
                      ? 'border-red-500'
                      : ''
                  }
                  disabled={isSubmitting}
                />
                {errors.members?.[index]?.name &&
                  touched.members?.[index]?.name && (
                    <p className="text-sm text-red-600">
                      {errors.members[index].name}
                    </p>
                  )}
              </div>

              <div className="flex items-center space-x-2">
                <Field
                  as={Checkbox}
                  id={`members.${index}.isAdult`}
                  name={`members.${index}.isAdult`}
                  disabled={isSubmitting}
                />
                <Label htmlFor={`members.${index}.isAdult`}>Adult (18+)</Label>
              </div>

              {member.isAdult && (
                <div className="space-y-2">
                  <Label htmlFor={`members.${index}.email`}>
                    Email Address
                  </Label>
                  <Field
                    as={Input}
                    id={`members.${index}.email`}
                    name={`members.${index}.email`}
                    type="email"
                    className={
                      errors.members?.[index]?.email &&
                      touched.members?.[index]?.email
                        ? 'border-red-500'
                        : ''
                    }
                    disabled={isSubmitting}
                  />
                  {errors.members?.[index]?.email &&
                    touched.members?.[index]?.email && (
                      <p className="text-sm text-red-600">
                        {errors.members[index].email}
                      </p>
                    )}
                </div>
              )}

              <div className="space-y-2">
                <Label>Dietary Restrictions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {dietaryOptions.map((restriction) => (
                    <label
                      key={restriction}
                      className="flex items-center space-x-2"
                    >
                      <Field
                        as={Checkbox}
                        name={`members.${index}.dietaryRestrictions`}
                        value={restriction}
                        disabled={isSubmitting}
                      />
                      <span className="text-sm">{restriction}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {values.members.length < MAX_FAMILY_MEMBERS && (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                arrayHelpers.push({
                  name: '',
                  email: '',
                  dietaryRestrictions: [],
                  isAdult: false,
                  isPrimaryContact: false,
                })
              }
              className="w-full"
              disabled={isSubmitting}
            >
              Add Family Member
            </Button>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(0)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register Family'}
            </Button>
          </div>
        </div>
      )}
    />
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

          <Formik
            initialValues={initialValues}
            validationSchema={familyRegistrationSchema}
            onSubmit={handleSubmit}
          >
            {(formikProps) => (
              <Form className="space-y-6">
                {currentStep === 0
                  ? renderBasicInfoStep(formikProps)
                  : renderMembersStep(formikProps)}
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
};

export default FamilyRegistrationForm;
