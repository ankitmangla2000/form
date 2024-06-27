import React, { useState, useEffect } from 'react';
import { useFormik, FieldArray, FormikProvider, ErrorMessage , FormikErrors} from 'formik';
import * as Yup from 'yup';
import Switch from 'react-switch';
import { useNavigate } from 'react-router-dom';
import './ThirdPartyDesigneeForm.css';
import formDetails from './details.json';

interface Designee {
  allowDesignee: boolean;
  designeeName: string;
  phoneNumber: string;
  pinNumber: string;
}

interface Vehicle {
  vinNumber: string;
  modelNumber: string;
}

interface FormValues {
  designee: Designee;
  vehicles: Vehicle[];
}

const ThirdPartyDesigneeForm: React.FC = () => {
  const initialValues: FormValues = {
    designee: {
      allowDesignee: false,
      designeeName: '',
      phoneNumber: '',
      pinNumber: '',
    },
    vehicles: [{ vinNumber: '', modelNumber: '' }],
  };

  const designeeValidationSchema = Yup.object().shape({
    allowDesignee: Yup.boolean(),
    designeeName: Yup.string().when('allowDesignee', {
      is: true,
      then: (schema) => schema.required('Designee Name is required'),
      otherwise: (schema) => schema,
    }),
    phoneNumber: Yup.string().when('allowDesignee', {
      is: true,
      then: (schema) =>
        schema
          .matches(/^\d+$/, 'Phone number must contain only digits')
          .min(10, 'Phone number must be exactly 10 digits')
          .max(10, 'Phone number must be exactly 10 digits')
          .required('Phone Number is required'),
      otherwise: (schema) => schema,
    }),
    pinNumber: Yup.string().when('allowDesignee', {
      is: true,
      then: (schema) => schema.required('PIN Number is required'),
      otherwise: (schema) => schema,
    }),
  });

  const vehicleValidationSchema = Yup.object().shape({
    vinNumber: Yup.string().required('VIN Number is required'),
    modelNumber: Yup.string().required('Model Number is required'),
  });

  const validationSchema = Yup.object().shape({
    designee: designeeValidationSchema,
    vehicles: Yup.array().of(vehicleValidationSchema),
  });

  
  const [savedValues, setSavedValues] = useState<FormValues | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const navigate = useNavigate();
  
  const [addMoreErrors, setAddMoreErrors] = useState<string[]>([]);
 
  useEffect(() => {
    const storedValues = localStorage.getItem('formValues');
    if (storedValues) {
      setSavedValues(JSON.parse(storedValues));
    }
  }, []);
  useEffect(() => {
    if (savedValues) {
      formik.setValues(savedValues);
    }
  }, [savedValues]);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      console.log('Form Values:', values);
      localStorage.setItem('formValues', JSON.stringify(values));
      setSavedValues(values);
   
    },
  });
 
  const handleAddMore = async () => {
    // Validate the entire form including existing vehicle entries
    const errors = await formik.validateForm();

    if (Object.keys(errors).length === 0) {
      // Validation successful, add a new blank vehicle
      const newVehicle: Vehicle = { vinNumber: '', modelNumber: '' };
      formik.setFieldValue('vehicles', [...formik.values.vehicles, newVehicle]);
    } else {
      // Highlight errors on the form
      formik.setTouched({
        designee: {
          allowDesignee: true,
          designeeName: true,
          phoneNumber: true,
          pinNumber: true,
        },
        vehicles: formik.values.vehicles.map(() => ({
          vinNumber: true,
          modelNumber: true,
        })),
      });
    }
  };
  const handleNext = async () => {
    // Reset error state
    setAddMoreErrors([]);
  formik.setErrors({});
    const errors = await formik.validateForm();
    if (Object.keys(errors).length === 0) {
      formik.submitForm();
      navigate('/second');
    } else {
      formik.setTouched({
        designee: {
          allowDesignee: true,
          designeeName: true,
          phoneNumber: true,
          pinNumber: true,
        },
        vehicles: formik.values.vehicles.map(() => ({
          vinNumber: true,
          modelNumber: true,
        })),
      });
    }
  };
  const handleEdit = () => {
    setIsEditing(true);
  };
  useEffect(() => {
    // Clear localStorage on component mount
    localStorage.removeItem('formValues');
    formik.resetForm();
  }, []);
  return (
    <div className="form-container">
      <h1>Third Party Designee</h1>
      {savedValues && !isEditing ? (
        <div>
          <h2>Saved Values</h2>
          <pre>{JSON.stringify(savedValues, null, 2)}</pre>
          <button onClick={handleEdit}>Edit</button>
        </div>
      ) :(
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit}>
          <div className="designee-entry">
            <div className="form-group">
              <label>
                Do you want to allow another person to discuss this return with IRS?
              </label>
              <Switch
                onChange={(checked) => formik.setFieldValue('designee.allowDesignee', checked)}
                checked={formik.values.designee.allowDesignee}
                className="toggle-switch"
                offColor="#888"
                onColor="#6A1B9A"
                checkedIcon={<div className="switch-checked">Yes</div>}
                uncheckedIcon={<div className="switch-unchecked">No</div>}
              />
            </div>
            {formik.values.designee.allowDesignee && (
              <div className="designee-details">
                <div className="form-group-row">
                  {formDetails.slice(0, 3).map((field, fieldIndex) => (
                    <label key={fieldIndex} htmlFor={`designee.${field.htmlFor}`}>
                      {field.label}
                    </label>
                  ))}
                </div>
                <div className="form-group-row">
                  {formDetails.slice(0, 3).map((field, fieldIndex) => (
                    <div key={fieldIndex}>
                      <input
                        type={field.type}
                        id={`designee.${field.id}`}
                        name={`designee.${field.name}`}
                        placeholder={field.placeholder}
                        className="form-input"
                        value={formik.values.designee[field.name as keyof Designee] as string}
                        onChange={formik.handleChange}
                        onKeyDown={(event) => {
                          if (field.name === 'phoneNumber' && (event.key === 'Backspace' || event.key === 'Delete')) {
                            return;
                          }
                          if (field.name === 'phoneNumber'&&(!/\d/.test(event.key))) {
                            event.preventDefault();
                          }
                        }}

                        {...(field.name === 'phoneNumber' ? {
                          pattern: '^[0-9]*$',  
                          maxLength: 10         
                        } : {})}

                      />
                      <ErrorMessage name={`designee.${field.name}`} component="div" className="error" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <FieldArray name="vehicles">
            {({ remove }) => (
              <div>
                {formik.values.vehicles.map((vehicle, index) => (
                  <div key={index} className="vehicle-entry">
                    <div className="form-group-row">
                      {formDetails.slice(3, 5).map((field, fieldIndex) => (
                        <label key={fieldIndex} htmlFor={`vehicles.${index}.${field.htmlFor}`}>
                          {field.label}
                        </label>
                      ))}
                    </div>
                    <div className="form-group-row">
                      {formDetails.slice(3, 5).map((field, fieldIndex) => (
                        <div key={fieldIndex}>
                          <input
                            type={field.type}
                            id={`vehicles.${index}.${field.id}`}
                            name={`vehicles.${index}.${field.name}`}
                            placeholder={field.placeholder}
                            className="form-input"
                            value={formik.values.vehicles[index][field.name as keyof Vehicle] as string}
                            onChange={formik.handleChange}
                          />
                          {addMoreErrors[index] && (
                       <div className="error-message">
                     {field.name === 'vinNumber' && formik.errors.vehicles && typeof formik.errors.vehicles[index] === 'object' ? (
                        <div className="error">
                           {(formik.errors.vehicles[index] as FormikErrors<Vehicle>).vinNumber}
                         </div>
                           ) : field.name === 'modelNumber' && formik.errors.vehicles && typeof formik.errors.vehicles[index] === 'object' ? (
                           <div className="error">
                             {(formik.errors.vehicles[index] as FormikErrors<Vehicle>).modelNumber}
                          </div>
                          ) : null} 
                          </div>
                          )}
                          <ErrorMessage name={`vehicles.${index}.${field.name}`} component="div" className="error" />
                        </div>
                      ))}
                    </div>
                    {index > 0 && (
                      <button type="button" onClick={() => remove(index)} className="delete-button">
                        Delete
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={handleAddMore} className="add-more-button">
                  Add More Vehicle
                </button>
              </div>
            )}
          </FieldArray>
          <div className="button-group">
            <button type="button" className="next-button" onClick={handleNext}>
              Next
            </button>
            <button type="submit" className="submit-button">
              Submit
            </button>
          </div>
        </form>
      </FormikProvider>
)}</div>
  );
};

export default ThirdPartyDesigneeForm;
