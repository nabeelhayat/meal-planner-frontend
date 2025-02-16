import * as Yup from 'yup';
import {
  EMAIL_REGEX,
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
} from '@/constants/registration';

export const memberSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .min(MIN_NAME_LENGTH, `Name must be at least ${MIN_NAME_LENGTH} characters`)
    .max(MAX_NAME_LENGTH, `Name must not exceed ${MAX_NAME_LENGTH} characters`),
  email: Yup.string().when('isAdult', {
    is: (isAdult: boolean) => isAdult === true,
    then: () =>
      Yup.string()
        .matches(EMAIL_REGEX, 'Please enter a valid email address')
        .nullable(),
    otherwise: () => Yup.string().nullable(),
  }),
  isAdult: Yup.boolean(),
  dietaryRestrictions: Yup.array().of(Yup.string()),
  isPrimaryContact: Yup.boolean(),
});

export const familyRegistrationSchema = Yup.object().shape({
  familyName: Yup.string()
    .required('Family name is required')
    .min(
      MIN_NAME_LENGTH,
      `Family name must be at least ${MIN_NAME_LENGTH} characters`
    )
    .max(
      MAX_NAME_LENGTH,
      `Family name must not exceed ${MAX_NAME_LENGTH} characters`
    ),
  email: Yup.string()
    .required('Family email is required')
    .matches(EMAIL_REGEX, 'Please enter a valid email address'),
  members: Yup.array()
    .of(memberSchema)
    .min(1, 'At least one family member is required')
    .test(
      'has-adult',
      'At least one adult member is required',
      function (members) {
        return members?.some((member) => member.isAdult) ?? false;
      }
    ),
});
