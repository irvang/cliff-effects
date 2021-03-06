// REACT COMPONENTS
import React from 'react';
import {
  Form,
  Radio,
  Checkbox,
  Header,
} from 'semantic-ui-react';

// PROJECT COMPONENTS
import FormPartsContainer from './FormPartsContainer';
import { AttentionArrow } from './formHelpers';
import { CashFlowRow } from './cashflow';
import { ControlledRadioYesNo } from './inputs';
import {
  ContentH1,
  IntervalColumnHeadings,
} from '../components/headings';
import {
  ContractRentField,
  RentShareField,
  PlainRentRow,
} from './rentFields';
import CashFlowRowAfterConfirm from './CashFlowRowAfterConfirm';
import { HeadingWithDetail } from '../components/details';

// LOGIC
import {
  getEveryMember,
  isHeadOrSpouse,
  getDependentMembers,
  isDisabled,
  isUnder13,
} from '../utils/getMembers';
import { getUnder13Expenses } from '../utils/cashflow';


// ========================================
// COMPONENTS
// ========================================
const EarnedFrom = function ({ hasExpenses, cashflowProps, children }) {

  if (hasExpenses) {

    // Because we're familiar with the benefit code, we
    // happen to know these values don't need to be reset
    // to 0, even if the client erases childcare expenses.
    // Not sure if that's a great general practice, though.
    return (
      <div className= { 'earned-from' }>
        <AttentionArrow />
        <CashFlowRowAfterConfirm { ...cashflowProps }>
          { children }
        </CashFlowRowAfterConfirm>
      </div>
    );

  } else {
    return null;
  }

};  // End EarnedFrom


const Utilities = function ({ current, type, time, updateClientValue }) {

  let climate     = current.climateControl,
      electricity = current.nonHeatElectricity,
      phone       = current.phone,
      fuelAssist  = current.fuelAssistance;

  let setChecked = function (evnt, inputProps) {
    var obj = { ...inputProps, value: inputProps.checked };
    updateClientValue(evnt, obj);
  };  // End setChecked()

  return (
    <div>
      <Header as='h4'>Which of these utilities do you pay for?</Header>

      <Checkbox
        name={ 'climateControl' }
        label={ 'Heating or cooling (e.g. A/C during summer)' }
        checked={ climate }
        onChange={ setChecked } />
      <br />
      <Checkbox
        name={ 'nonHeatElectricity' }
        label={ 'Electricity for non-heating purposes' }
        checked={ electricity }
        onChange={ setChecked } />
      <br />
      <Checkbox
        name={ 'phone' }
        label={ 'Telephone service' }
        checked={ phone }
        onChange={ setChecked } />

      <br />
      <br />
      <ControlledRadioYesNo
        labelText          = { 'Do you get Fuel Assistance?' }
        checked            = { fuelAssist }
        name               = { 'fuelAssistance' }
        updateClientValue = { updateClientValue } />

    </div>

  );
};  // End Utilities(<>)


const HousingDetails = function ({ current, type, time, updateClientValue }) {

  let housing = current.housing,
      sharedProps = {
        timeState:         current,
        current:           current,
        type:              type,
        time:              time,
        updateClientValue: updateClientValue,
      };

  if (current.housing === 'voucher') {
    return (
      <div>
        <ContractRentField { ...sharedProps } />
        <RentShareField { ...sharedProps } />
        <Utilities { ...sharedProps } />
      </div>
    );

  } else if (housing === 'homeless') {
    return null;

  } else if (housing === 'renter') {
    return (
      <div>
        <br />
        <PlainRentRow { ...sharedProps } />
        <Utilities { ...sharedProps } />
      </div>
    );

  } else if (housing === 'homeowner') {
    return (
      <div>
        <IntervalColumnHeadings type={ type } />
        <CashFlowRow
          { ...sharedProps }
          generic={ 'mortgage' }> Mortgage 
        </CashFlowRow>
        <CashFlowRow
          { ...sharedProps }
          generic={ 'housingInsurance' }> Insurance Costs 
        </CashFlowRow>
        <CashFlowRow
          { ...sharedProps }
          generic={ 'propertyTax' }> Property Tax 
        </CashFlowRow>
        <Utilities { ...sharedProps } />
      </div>
    );

  }  // end which expenses
};  // End HousingDetails(<>)


const HousingRadio = function ({ currentValue, label, time, updateClientValue }) {

  var value = label.toLowerCase();

  return (
    <Form.Field>
      <Radio
        name={ 'housing' }
        label={ label }
        value={ value }
        checked={ currentValue === value }
        onChange = { updateClientValue } />
    </Form.Field>
  );

};  // End HousingRadio(<>)


/** 
 * @function
 * @param {object} props
 * @param {object} props.current - Client data of current user circumstances
 * @param {string} props.type - 'expense' or 'income', etc., for classes
 * @param {string} props.time - 'current' or 'future'
 * @param {function} props.updateClientValue - Sets state values
 * 
 * @returns React element
 */
const Housing = function ({ current, type, time, updateClientValue }) {

  // We're using a bunch of radio buttons. Since `checked` is defined
  // in Radio components, `updateClientValue()` would store it, but we
  // want the value, so get rid of checked.
  /** Makes sure values are propagated to 'current' properties if needed. */
  let ensureRouteAndValue = function (evnt, inputProps) {
    var obj = { ...inputProps, name: inputProps.name, value: inputProps.value, checked: null };
    updateClientValue(evnt, obj);
  };

  let sharedProps = {
    current:           current,
    type:              type,
    time:              time,
    updateClientValue: ensureRouteAndValue,
  };

  return (
    <div>

      <ContentH1>Housing</ContentH1>

      { current.housing === 'voucher'
        ? null
        : 
        <div>
          
          <Header as='h4'>What is your housing situation?</Header>
          <HousingRadio
            currentValue={ current.housing }
            label={ 'Homeless' }
            time={ time }
            updateClientValue = { ensureRouteAndValue } />
          <HousingRadio
            currentValue={ current.housing }
            label={ 'Renter' }
            time={ time }
            updateClientValue = { ensureRouteAndValue } />
          <HousingRadio
            currentValue={ current.housing }
            label={ 'Homeowner' }
            time={ time }
            updateClientValue = { ensureRouteAndValue } />

        </div>}

      <HousingDetails { ...sharedProps } />

    </div>
  );

};  // End Housing()


/** 
 * @function
 * @param {object} props
 * @param {object} props.current - Client data of current user circumstances
 * @param {object} props.time - 'current' or 'future'
 * @param {object} props.updateClientValue - Sets state values
 * 
 * @returns React element
 */
const ExpensesFormContent = function ({ current, time, updateClientValue, snippets }) {

  let type        = 'expense',
      household   = current.household,
      sharedProps = {
        timeState:         current,
        type:              type,
        time:              time,
        updateClientValue: updateClientValue,
      };

  /** @todo Make an age-checking function to
   *     keep household data structure under 
   *     control in one place. */
  var isOver12 = function (member) { 
    return !isUnder13(member);
  };

  // Won't include head or spouse
  var allDependents = getDependentMembers(household),
      under13       = getEveryMember(allDependents, isUnder13),
      over12        = getEveryMember(allDependents, isOver12);

  // 'Elderly' here is using the lowest common denominator - SNAP standards.
  var isElderlyOrDisabled = function (member) {
    return isDisabled(member) || member.m_age >= 60;
  };
  var elderlyOrDisabled = getEveryMember(household, isElderlyOrDisabled),
      elderlyOrDisabledHeadOrSpouse = getEveryMember(elderlyOrDisabled, isHeadOrSpouse);

  return (
    <div className='field-aligner two-column'>

      { under13.length > 0
        ? 
        <div>
          <ContentH1 subheading = { snippets.unreimbursedNonMedicalChildCare.subheading }>
            { snippets.unreimbursedNonMedicalChildCare.sectionHeading }
          </ContentH1>
          <IntervalColumnHeadings type={ type } />
          <CashFlowRow
            { ...sharedProps }
            generic={ 'childDirectCare' }> 
            { snippets.unreimbursedNonMedicalChildCare.childDirectCare.label }
          </CashFlowRow>
          <CashFlowRow
            { ...sharedProps }
            generic={ 'childBeforeAndAfterSchoolCare' }>
            { snippets.unreimbursedNonMedicalChildCare.childBeforeAndAfterSchoolCare.label}
          </CashFlowRow>
          <CashFlowRow
            { ...sharedProps }
            generic={ 'childTransportation' }> 
            { snippets.unreimbursedNonMedicalChildCare.childTransportation.label }
          </CashFlowRow>
          <CashFlowRow
            { ...sharedProps }
            generic={ 'childOtherCare' }> 
            { snippets.unreimbursedNonMedicalChildCare.childOtherCare.label }
          </CashFlowRow>

          <EarnedFrom
            hasExpenses   ={ getUnder13Expenses(current) !== 0 }
            cashflowProps ={{
              ...sharedProps,
              generic:      'earnedBecauseOfChildCare',
              confirmLabel: `If you didn't have that child care, would it change how much pay you can bring home?`,
            }}>
            How much less would you make?
          </EarnedFrom>
        </div>
        : null
      }

      { current.hasSnap
        ? 
        <div>
          <ContentH1>Child Support</ContentH1>
          <IntervalColumnHeadings type={ type } />
          <CashFlowRow
            { ...sharedProps }
            generic={ 'childSupportPaidOut' }> <strong>Legally obligated</strong> child support 
          </CashFlowRow>
        </div>
        : null
      }

      {/* Head or spouse can't be a dependent, so they don't count. */}
      { over12.length > 0
        ? 
        <div>
          <ContentH1 subheading = { 'For the care of people who are older than 12, but are still dependents (those under 18 or disabled). Don\'t include amounts that are paid for by other benefit programs.\n' }>
            Dependent Care of Persons Over 12 Years of Age
          </ContentH1>
          <IntervalColumnHeadings type={ type } />
          <CashFlowRow
            { ...sharedProps }
            generic={ 'adultDirectCare' }> Direct care costs 
          </CashFlowRow>
          <CashFlowRow
            { ...sharedProps }
            generic={ 'adultTransportation' }> Transportation costs 
          </CashFlowRow>
          <CashFlowRow
            { ...sharedProps }
            generic={ 'adultOtherCare' }> Other care 
          </CashFlowRow>
        </div>
        : null
      }

      { elderlyOrDisabled.length > 0
        ? 
        <div>
          <HeadingWithDetail>
            <ContentH1>Unreimbursed Disabled/Handicapped/Elderly Assistance</ContentH1>
            <div>
              <div>Unreimbursed expenses to cover care attendants and auxiliary apparatus for any family member who is elderly or is a person with disabilities. Auxiliary apparatus are items such as wheelchairs, ramps, adaptations to vehicles, or special equipment to enable a blind person to read or type, but only if these items are directly related to permitting the disabled person or other family member to work.</div>
              <div>Examples of eligible disability assistance expenses:</div>
              <ul>
                <li>The payments made on a motorized wheelchair for the 42 year old son of the head of household enable the son to leave the house and go to work each day on his own. Prior to the purchase of the motorized wheelchair, the son was unable to make the commute to work. These payments are an eligible disability assistance expense.</li>
                <li>Payments to a care attendant to stay with a disabled 16-year-old child allow the child’s mother to go to work every day. These payments are an eligible disability assistance allowance.</li>
              </ul>
            </div>
          </HeadingWithDetail>
          <IntervalColumnHeadings type={ type } />
          <CashFlowRow
            { ...sharedProps }
            generic={ 'disabledAssistance' }> Disabled/Handicapped assistance 
          </CashFlowRow>

          <EarnedFrom
            hasExpenses   ={ current.disabledAssistance !== 0 }
            cashflowProps ={{
              ...sharedProps,
              generic:      'earnedBecauseOfAdultCare',
              confirmLabel: `If you didn't have that assistance, would it change how much pay you can bring home?`,
            }}>
            How much less would you make?
          </EarnedFrom>
        </div>
        : null
      }

      {/** These medical expenses don't count for Section 8 unless
        *     the disabled person is the head or spouse. From 
        *     {@link http://www.tacinc.org/media/58886/S8MS%20Full%20Book.pdf}
        *     Appendix B, item (D) */}
      { elderlyOrDisabledHeadOrSpouse.length > 0 || (current.hasSnap && elderlyOrDisabled.length > 0)
        ? 
        <div>

          <HeadingWithDetail>
            <ContentH1>Unreimbursed Medical Expenses</ContentH1>
            <div>
              <div>Do not repeat anything you already listed in the section above. Examples of allowable medical expenses:</div>
              <ul>
                <li>The orthodontist expenses for a child’s braces.</li>
                <li>Services of doctors and health care professionals.</li>
                <li>Services of health care facilities.</li>
                <li>Medical insurance premiums. </li>
                <li>Prescription/non-prescription medicines (prescribed by a physician).</li>
                <li>Transportation to treatment (cab fare, bus fare, mileage).</li>
                <li>Dental expenses, eyeglasses, hearing aids, batteries.</li>
                <li>Live-in or periodic medical assistance.</li>
                <li>Monthly payment on accumulated medical bills (regular monthly payments on a bill that was previously incurred).</li>
              </ul>
            </div>
          </HeadingWithDetail>
          <IntervalColumnHeadings type={ type } />
          <CashFlowRow
            { ...sharedProps }
            generic='disabledMedical'> Disabled/Elderly medical expenses 
          </CashFlowRow>
          <CashFlowRow
            { ...sharedProps }
            generic='otherMedical'> Medical expenses of other members 
          </CashFlowRow>
        </div>
        : null
      }

      <Housing
        current={ current }
        time={ time }
        type={ type }
        updateClientValue = { updateClientValue } />
    </div>
  );

};  // End ExpensesFormContent()

/**
 * @todo SNAP: Does a medical assistant's payments count as a medical expense?
 *     (Answer: Yes. @see {@link https://www.mass.gov/service-details/snap-verifications})
 * @todo SNAP: Medical expense only matters if household has elder/disabled, but
 *     are they any medical expenses or only those of the disabled person? "Medical
 *     Expenses for Disabled or Elderly". Also, do they sometimes need to
 *     enter medical expenses even if they don't have an elderly or disabled
 *     household member?
 */

/** 
  * @function
  * @param {object} props
  * @param {function} props.updateClientValue - Setting client state
  * @param {function} props.previousStep - Go to previous form step
  * @param {function} props.nextStep - Go to next form step
  * @param {object} props.client - Object will all the data for calculating benefits
  * 
  * @returns React element
  */
// `props` is a cloned version of the original props. References broken.
const CurrentExpensesStep = function ({ updateClientValue, navData, client, snippets }) {

  return (
    <Form className = 'expense-form flex-item flex-column'>
      <FormPartsContainer
        title     = { snippets.title }
        clarifier = { snippets.clarifier }
        navData   = { navData }>
        <ExpensesFormContent
          updateClientValue = { updateClientValue }
          current={ client.current }
          time={ 'current' }
          snippets={ snippets } />
      </FormPartsContainer>
    </Form>
  );

};  // End CurrentExpensesStep()


export { CurrentExpensesStep };
