import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/colors';
import { useAuth } from '../contexts/AuthContext';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
  onRegister: (userData: MechanicRegistrationData) => void;
}

export interface MechanicRegistrationData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  ethnicity: string;
  
  // Address Information
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Professional Information
  yearsOfExperience: string;
  certifications: string;
  specialties: string;
  emergencyContact: string;
  emergencyPhone: string;
  
  // Business Information
  businessName: string;
  businessLicense: string;
  insuranceNumber: string;
  
  // Vehicle Information
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  licensePlate: string;
}

export default function RegisterScreen({ onNavigateToLogin, onRegister }: RegisterScreenProps) {
  const { isLoading } = useAuth();
  const [formData, setFormData] = useState<MechanicRegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    ethnicity: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    yearsOfExperience: '',
    certifications: '',
    specialties: '',
    emergencyContact: '',
    emergencyPhone: '',
    businessName: '',
    businessLicense: '',
    insuranceNumber: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    licensePlate: '',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const updateFormData = (field: keyof MechanicRegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
          Alert.alert('Error', 'Please fill in all required fields');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          Alert.alert('Error', 'Passwords do not match');
          return false;
        }
        if (formData.password.length < 8) {
          Alert.alert('Error', 'Password must be at least 8 characters long');
          return false;
        }
        if (!formData.email.includes('@')) {
          Alert.alert('Error', 'Please enter a valid email address');
          return false;
        }
        break;
      case 2:
        if (!formData.phone || !formData.dateOfBirth || !formData.gender || !formData.ethnicity) {
          Alert.alert('Error', 'Please fill in all required fields');
          return false;
        }
        break;
      case 3:
        if (!formData.streetAddress || !formData.city || !formData.state || !formData.zipCode) {
          Alert.alert('Error', 'Please fill in all address fields');
          return false;
        }
        break;
      case 4:
        if (!formData.yearsOfExperience || !formData.businessName || !formData.businessLicense) {
          Alert.alert('Error', 'Please fill in all required professional fields');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleRegister();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRegister = async () => {
    if (!validateStep(currentStep)) return;

    try {
      await onRegister(formData);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Please try again');
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View key={index} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            currentStep > index + 1 ? styles.stepCompleted :
            currentStep === index + 1 ? styles.stepActive :
            styles.stepInactive
          ]}>
            <Text style={[
              styles.stepText,
              currentStep > index + 1 ? styles.stepTextCompleted :
              currentStep === index + 1 ? styles.stepTextActive :
              styles.stepTextInactive
            ]}>
              {currentStep > index + 1 ? '✓' : index + 1}
            </Text>
          </View>
          {index < totalSteps - 1 && (
            <View style={[
              styles.stepLine,
              currentStep > index + 1 ? styles.stepLineCompleted : styles.stepLineInactive
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepSubtitle}>Let's start with your basic details</Text>
      
      <View style={styles.inputRow}>
        <View style={styles.inputHalf}>
          <Text style={styles.inputLabel}>First Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="First name"
            value={formData.firstName}
            onChangeText={(value) => updateFormData('firstName', value)}
          />
        </View>
        <View style={styles.inputHalf}>
          <Text style={styles.inputLabel}>Last Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Last name"
            value={formData.lastName}
            onChangeText={(value) => updateFormData('lastName', value)}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email Address *</Text>
        <TextInput
          style={styles.input}
          placeholder="your.email@example.com"
          value={formData.email}
          onChangeText={(value) => updateFormData('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password *</Text>
        <TextInput
          style={styles.input}
          placeholder="Create a password"
          value={formData.password}
          onChangeText={(value) => updateFormData('password', value)}
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Confirm Password *</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChangeText={(value) => updateFormData('confirmPassword', value)}
          secureTextEntry
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Additional Details</Text>
      <Text style={styles.stepSubtitle}>Tell us more about yourself</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="(555) 123-4567"
          value={formData.phone}
          onChangeText={(value) => updateFormData('phone', value)}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Date of Birth *</Text>
        <TextInput
          style={styles.input}
          placeholder="MM/DD/YYYY"
          value={formData.dateOfBirth}
          onChangeText={(value) => updateFormData('dateOfBirth', value)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Gender *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.gender}
            onValueChange={(value) => updateFormData('gender', value)}
            style={styles.picker}
          >
            <Picker.Item label="Select gender" value="" />
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
            <Picker.Item label="Non-binary" value="non-binary" />
            <Picker.Item label="Prefer not to say" value="prefer-not-to-say" />
          </Picker>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Ethnicity *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.ethnicity}
            onValueChange={(value) => updateFormData('ethnicity', value)}
            style={styles.picker}
          >
            <Picker.Item label="Select ethnicity" value="" />
            <Picker.Item label="White" value="white" />
            <Picker.Item label="Black or African American" value="black" />
            <Picker.Item label="Hispanic or Latino" value="hispanic" />
            <Picker.Item label="Asian" value="asian" />
            <Picker.Item label="Native American" value="native-american" />
            <Picker.Item label="Pacific Islander" value="pacific-islander" />
            <Picker.Item label="Other" value="other" />
            <Picker.Item label="Prefer not to say" value="prefer-not-to-say" />
          </Picker>
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Address Information</Text>
      <Text style={styles.stepSubtitle}>Where are you located?</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Street Address *</Text>
        <TextInput
          style={styles.input}
          placeholder="123 Main Street"
          value={formData.streetAddress}
          onChangeText={(value) => updateFormData('streetAddress', value)}
        />
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputHalf}>
          <Text style={styles.inputLabel}>City *</Text>
          <TextInput
            style={styles.input}
            placeholder="City"
            value={formData.city}
            onChangeText={(value) => updateFormData('city', value)}
          />
        </View>
        <View style={styles.inputHalf}>
          <Text style={styles.inputLabel}>State *</Text>
          <TextInput
            style={styles.input}
            placeholder="State"
            value={formData.state}
            onChangeText={(value) => updateFormData('state', value)}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>ZIP Code *</Text>
        <TextInput
          style={styles.input}
          placeholder="12345"
          value={formData.zipCode}
          onChangeText={(value) => updateFormData('zipCode', value)}
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Professional Information</Text>
      <Text style={styles.stepSubtitle}>Tell us about your business</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Business Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Your business name"
          value={formData.businessName}
          onChangeText={(value) => updateFormData('businessName', value)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Years of Experience *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 5"
          value={formData.yearsOfExperience}
          onChangeText={(value) => updateFormData('yearsOfExperience', value)}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Business License Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="License number"
          value={formData.businessLicense}
          onChangeText={(value) => updateFormData('businessLicense', value)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Insurance Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Insurance number (optional)"
          value={formData.insuranceNumber}
          onChangeText={(value) => updateFormData('insuranceNumber', value)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Certifications</Text>
        <TextInput
          style={styles.input}
          placeholder="ASE, etc. (optional)"
          value={formData.certifications}
          onChangeText={(value) => updateFormData('certifications', value)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Specialties</Text>
        <TextInput
          style={styles.input}
          placeholder="Engine repair, brakes, etc. (optional)"
          value={formData.specialties}
          onChangeText={(value) => updateFormData('specialties', value)}
        />
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onNavigateToLogin} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back to Login</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
        </View>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Form Content */}
        {renderCurrentStep()}

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.nextButton, isLoading && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={isLoading}
          >
            <Text style={styles.nextButtonText}>
              {isLoading ? 'Creating Account...' : 
               currentStep === totalSteps ? 'Create Account' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing['2xl'],
    marginBottom: spacing.xl,
  },
  backButton: {
    padding: spacing.sm,
  },
  backButtonText: {
    color: colors.primaryBlue,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  headerTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    marginLeft: spacing.base,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: {
    backgroundColor: colors.primaryBlue,
  },
  stepCompleted: {
    backgroundColor: colors.success,
  },
  stepInactive: {
    backgroundColor: colors.borderLight,
  },
  stepText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  stepTextActive: {
    color: colors.textWhite,
  },
  stepTextCompleted: {
    color: colors.textWhite,
  },
  stepTextInactive: {
    color: colors.textMedium,
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: spacing.sm,
  },
  stepLineCompleted: {
    backgroundColor: colors.success,
  },
  stepLineInactive: {
    backgroundColor: colors.borderLight,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    fontSize: fontSize.base,
    color: colors.textMedium,
    marginBottom: spacing['2xl'],
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  inputHalf: {
    flex: 0.48,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderMedium,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    backgroundColor: colors.bgPrimary,
    color: colors.textDark,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.borderMedium,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.bgPrimary,
  },
  picker: {
    height: 50,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing['2xl'],
    marginBottom: spacing.xl,
  },
  nextButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    flex: 1,
    alignItems: 'center',
    ...shadows.md,
  },
  nextButtonDisabled: {
    backgroundColor: colors.textLight,
  },
  nextButtonText: {
    color: colors.textWhite,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});
