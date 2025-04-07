import React from 'react';
import './App.css';
import logo from './logo.png';
import {jsPDF} from 'jspdf';
import SignatureCanvas from 'react-signature-canvas';
import { useRef, useState } from 'react';
import InputMask from 'react-input-mask';

function App() {
  const [formData, setFormData] = useState({
    employeeName: '',
    employeePhone: '',
    participantName: '',
    participantPhone: '',
    serviceLocation: '',
    missedDate: '',
    reasonForAdjustment: '',
    timeIn: '',
    timeOut: '',
    totalHours: '',
    services: {
      hairCare: false,
      shampoo: false,
      skinCare: false,
      mouthCare: false,
      footCare: false,
      nailCare: false,
      dressing: false,
      lightLaundry: false,
      bedLinenChange: false,
      makeBed: false,
      lightHousekeepingBathroom: false,
      lightHousekeepingBedroom: false,
      lightHousekeepingKitchen: false,
      cleanEquipment: false,
      dust: false,
      sweep: false,
      vacuum: false,
      prepareMeal: false,
      assistWithFeeding: false,
      shopping: false,
      preventWandering: false,
      tubBath: false,
      shower: false,
      bedBath: false,
      spongeBath: false,
      toiletHygiene: false,
      medicationReminder: false,
      turnReposition: false,
      assistWithAmbulation: false,
      incontinenceCare: false,
      hoyerLift: false,
      rangeOfMotion: false,
      assistWithTransfer: false,
      takeOutTrash: false,
      elevateHeadAfterMeals: false,
    },
    employeeSignature: '',
    participantAcknowledgement: '',
    actionTaken: '',
    approvedBy: '',
    title: '',
    approvalDate: '',
    otherOfficeUse: ''
  });
  const sigPadEmployeeRef = useRef(null);  // Reference for employee signature
  const sigPadParticipantRef = useRef(null); // Reference for participant signature
  

  // Function to clear signature
  const handleSignatureClear = (signatureType) => {
    if (signatureType === 'employee') {
      sigPadEmployeeRef.current.clear();
    } else if (signatureType === 'participant') {
      sigPadParticipantRef.current.clear();
    }
  };
  
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    
    if (name === 'serviceLocationOption') {
      setFormData({
        ...formData,
        serviceLocationOption: value,
        serviceLocation: value === 'other' ? '' : 'Home' // Reset or set Home automatically
      });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        services: {
          ...formData.services,
          [name]: checked
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  }

  const handleSubmit = async(e) => {
    e.preventDefault();

    const scaleFactor = 0.5;
    const employeeSignatureImage = sigPadEmployeeRef.current.getCanvas().toDataURL('image/png', scaleFactor);  // getCanvas().toDataURL() instead of getTrimmedCanvas()
    const participantSignatureImage = sigPadParticipantRef.current.getCanvas().toDataURL('image/png', scaleFactor);  // getCanvas().toDataURL() instead of getTrimmedCanvas()
    
    const doc = new jsPDF({ compress: true });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20; // Standard margin
    let yPosition = margin;
  
    // Add Logo
    doc.addImage(logo, 'PNG', 20, 5, 40, 30);
    yPosition += 10;
  
    // Title (Centered)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    const title = 'Ideal Home Health Agency';
    doc.text(title, (pageWidth - doc.getTextWidth(title)) / 2, 10);
    yPosition = 15; 
  
    // Contact Info (Centered)
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    const contactInfo = [
      '101 Towne Square Way, Ste 281',
      'Pittsburgh, PA 15227',
      'Email: info@idealhha.com',
      'Phone: 412-653-1060',
      'Fax: 412-650-1045',
      'Website: www.idealhha.com'
    ];
    contactInfo.forEach((line) => {
      doc.text(line, (pageWidth - doc.getTextWidth(line)) / 2, yPosition);
      yPosition += 5;
    });
  
    yPosition += 4; // Extra space before form details
  
    const convertToStandardTime = (time) => {
      if (!time) return '';
      const [hour, minute] = time.split(':');
      const h = parseInt(hour, 10);
      const period = h >= 12 ? 'PM' : 'AM';
      const standardHour = h % 12 || 12; // Convert 0 to 12 for AM
      return `${standardHour}:${minute} ${period}`;
    };
    
    // Form Data
    const leftColumnX = 10;
    const rightColumnX = 100; // Adjust based on your page width
    let rowY = 50;

    doc.setFont('times', 'bold');
    doc.text('Employee Name:', leftColumnX, rowY);
    doc.setFont('times', 'normal');
    doc.text(formData.employeeName || '____________________', leftColumnX + 30, rowY);

    doc.setFont('times', 'bold');
    doc.text('Employee Phone:', rightColumnX, rowY);
    doc.setFont('times', 'normal');
    doc.text(formData.employeePhone || '____________________', rightColumnX + 30, rowY);

    rowY += 6;

    doc.setFont('times', 'bold');
    doc.text('Participant Name:', leftColumnX, rowY);
    doc.setFont('times', 'normal');
    doc.text(formData.participantName || '____________________', leftColumnX + 30, rowY);

    doc.setFont('times', 'bold');
    doc.text('Participant Phone:', rightColumnX, rowY);
    doc.setFont('times', 'normal');
    doc.text(formData.participantPhone || '____________________', rightColumnX + 30, rowY);

    yPosition += 14;

    doc.setFontSize(12);
    const formDataLines = [
      `Service Location: ${formData.serviceLocation}`,
      `Missed Date: ${formData.missedDate}`,
      `Reason for Adjustment/Comments: ${formData.reasonForAdjustment}`,
      `Time In: ${convertToStandardTime(formData.timeIn)}`,
      `Time Out: ${convertToStandardTime(formData.timeOut)}`,
      `Total Hours: ${formData.totalHours}`
    ];
  
    formDataLines.forEach((line) => {
      doc.text(line, margin, yPosition);
      yPosition += 6;
    });

    yPosition += 3; // Extra space before Services Completed
  
    // **Split "Services Completed" into Two Columns**
    doc.setFont('times', 'bold');
    doc.text('Services Completed:', margin, yPosition);
    doc.setFont('times', 'normal');
    yPosition += 6;
  
    const servicesArray = Object.keys(formData.services).filter(service => formData.services[service]);
    const midIndex = Math.ceil(servicesArray.length / 2);
    const column1 = servicesArray.slice(0, midIndex);
    const column2 = servicesArray.slice(midIndex);
  
    // Define column positions
    const column1X = margin;
    const column2X = pageWidth / 2;
  
    column1.forEach((service, index) => {
      doc.text(`- ${service.replace(/([A-Z])/g, ' $1').trim()}`, column1X, yPosition + index * 6);
    });
  
    column2.forEach((service, index) => {
      doc.text(`- ${service.replace(/([A-Z])/g, ' $1').trim()}`, column2X, yPosition + index * 6);
    });
  
    yPosition += Math.max(column1.length, column2.length) * 6 + 10; // Adjust yPosition for next section

    const servicesHeight = Math.max(column1.length, column2.length) * 6 + 10;

     // Ensure yPosition moves down accordingly
     yPosition += servicesHeight;

    // Add additional spacing to prevent overlap
   const minSpacing = 50; // Adjust this value as needed
   if (yPosition < pageHeight - 100) {  
     yPosition += minSpacing;
   } else {
     yPosition = pageHeight - 70; // Ensure it doesn't go too far
  }

    // Add "Participant Acknowledgement" section right after "Services Completed"
   yPosition += 25;
   doc.setFont('times', 'bold');
   doc.text('Participant Acknowledgement:', margin, yPosition);
   yPosition += 6;

   doc.setFont('times', 'normal');
   doc.text('By signing below, I certify that I received the services mentioned above on the date and time.', margin, yPosition, { maxWidth: pageWidth - 40 });
   yPosition += 10;

   doc.text(`Date: ${formData.participantAcknowledgement || '____________________'}`, margin, yPosition);
   yPosition += 5;

  
    const bottomSectionStartY = pageHeight - 100; // Adjust this value to give more space at the bottom
    
    const signatureYPosition = pageHeight - 75; // Adjust the Y position based on the page layout
    doc.setFont('times', 'bold');
    doc.text('Employee Signature:', margin, signatureYPosition);
    doc.addImage(employeeSignatureImage, 'JPEG', margin + 50, signatureYPosition - 10, 50, 15);

    // **Participant Acknowledgement Section (Image)**
    doc.setFont('times', 'bold');
    doc.text('Participant Signature:', margin, signatureYPosition + 15);
    doc.addImage(participantSignatureImage, 'JPEG', margin + 50, signatureYPosition + 10, 50, 10);
  
    // **For Office Use Only Section**
    const officeUseStartY = bottomSectionStartY + 80;  // Further increase vertical spacing
  
    doc.setFont('times', 'bold');
    doc.text('Action Taken: ____________________', column1X, officeUseStartY);
    doc.setFont('times', 'normal');
    doc.text(formData.actionTaken, column1X + 50, officeUseStartY);
  
    doc.setFont('times', 'bold');
    doc.text('Approved By: ____________________', column1X, officeUseStartY + 10);
    doc.setFont('times', 'normal');
    doc.text(formData.approvedBy, column1X + 50, officeUseStartY + 10);
  
    // Set the font and add the right column text
    doc.setFont('times', 'bold');
    doc.text('Title: ___________________', column2X, officeUseStartY);
    doc.setFont('times', 'normal');
    doc.text(formData.title, column2X + 50, officeUseStartY);
  
    doc.setFont('times', 'bold');
    doc.text('Approval Date: ____________________', column2X, officeUseStartY + 10);
    doc.setFont('times', 'normal');
    doc.text(formData.approvalDate, column2X + 50, officeUseStartY + 10);

    // Output PDF as a Blob to preview
    const pdfBlob = doc.output('blob');
    console.log(`PDF Size: ${pdfBlob.size / 1024 / 1024} MB`);
    const formDataToSend = new FormData();
    formDataToSend.append("pdf", pdfBlob, "form-submission.pdf");

   try {
    const response = await fetch("http://localhost:5000/send-email", {
      method: "POST",
      body: formDataToSend,
    });

    if (response.ok) {
      alert("Form submitted and emailed successfully!");
    } else {
      alert("Failed to submit!.");
    }
  } catch (error) {
    console.error("Error submitting form:", error);
  }


};
  
  
  return (  
    <div className="App">
      <header>
      <img src={logo} alt="Company Logo" className='App-logo'/>
      <h1>Ideal Home Health Agency</h1>
      <div className="contact-info">
        <p>101 Towne Square Way, Ste 281</p>
        <p>Pittsburgh, PA 15227</p>
        <p>Email: info@idealhha.com</p>
        <p>Phone: 412-653-1060</p>
        <p>Fax: 412-650-1045</p>
        <p>Website: www.idealhha.com</p>
      </div>
    </header>

      <form onSubmit={handleSubmit}>
        <section className="participant-info">
          <label>Employee Name:
            <input
              type="text"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleChange}
            />
          </label>
          <label>Employee Phone:
            <InputMask
              mask="(999) 999-9999"
              type="text"
              name="employeePhone"
              value={formData.employeePhone}
              onChange={handleChange}
            />
          </label>
          <label>Participant Name:
            <input
              type="text"
              name="participantName"
              value={formData.participantName}
              onChange={handleChange}
            />
          </label>
          <label>Participant Phone:
            <InputMask
              mask="(999) 999-9999"
              type='text'
              name="participantPhone"
              value={formData.participantPhone}
              onChange={handleChange}
            />
          </label>
        </section>

        <section className="service-info">
        <label>Service Location:</label>
       <div>
       <label>
       <input
        type="radio"
        name="serviceLocationOption"
        value="participantsHome"
        checked={formData.serviceLocationOption === "participantsHome"}
        onChange={handleChange}
       />
       Participant's Home
       </label>
       <label>
       <input
        type="radio"
        name="serviceLocationOption"
        value="other"
        checked={formData.serviceLocationOption === "other"}
        onChange={handleChange}
       />
       Other
       </label>
       </div>
  
       {formData.serviceLocationOption === "other" && (
       <textarea
       name="serviceLocation"
       placeholder="Please specify the service location"
       value={formData.serviceLocation || ""}
       onChange={handleChange}
       />
       )}

          <label>Missed Date:
            <input
              type="date"
              name="missedDate"
              value={formData.missedDate}
              onChange={handleChange}
            />
          </label>
          <label>Reason for Adjustment/Comments:
            <textarea
              name="reasonForAdjustment"
              value={formData.reasonForAdjustment}
              onChange={handleChange}
            />
          </label>

          <div className="time-info">
            <label>Time In:
              <input
                type="time"
                name="timeIn"
                value={formData.timeIn}
                onChange={handleChange}
              />
            </label>
            <label>Time Out:
              <input
                type="time"
                name="timeOut"
                value={formData.timeOut}
                onChange={handleChange}
              />
            </label>
            <label>Total Hours:
              <input
                type="number"
                name="totalHours"
                value={formData.totalHours}
                onChange={handleChange}
              />
            </label>
          </div>
          <div className="services">
       <h2>Please check all the services completed during the visit: HHA</h2>
       <div className="services-grid">
       <div className="services-column">
       {Object.keys(formData.services).slice(0, Math.ceil(Object.keys(formData.services).length / 2)).map((service) => (
        <label key={service}>
          <input
            type="checkbox"
            name={service}
            checked={formData.services[service]}
            onChange={handleChange}
          />
          {service.replace(/([A-Z])/g, ' $1').trim()}
          </label>
       ))}
       </div>
       <div className="services-column">
       {Object.keys(formData.services).slice(Math.ceil(Object.keys(formData.services).length / 2)).map((service) => (
        <label key={service}>
          <input
            type="checkbox"
            name={service}
            checked={formData.services[service]}
            onChange={handleChange}
          />
          {service.replace(/([A-Z])/g, ' $1').trim()}
        </label>
       ))}
       </div>
       </div>
       </div>
       </section>

       <div className="acknowledgement">
            <label>Participant Acknowledgement:</label>
            <p>By signing below, I certify that I received the services mentioned above on the date and time.</p>
            
            <label>Date:
              <input
                type="date"
                name="participantAcknowledgement"
                value={formData.participantAcknowledgement}
                onChange={handleChange}
              />
            </label>
          </div>
       
        <section className="signatures">
          {/* Employee Signature */}
          <label>Employee Signature:</label>
          <SignatureCanvas
            ref={sigPadEmployeeRef}
            penColor="black"
            backgroundColor="white"
            canvasProps={{ width: 400, height: 100, className: 'sigCanvas' }}
          />
          <button type="button" onClick={() => handleSignatureClear('employee')}>Clear Signature</button>

          {/* Participant Signature */}
          <label>Participant Signature:</label>
          <SignatureCanvas
            ref={sigPadParticipantRef}
            penColor="black"
            backgroundColor="white"
            canvasProps={{ width: 400, height: 100, className: 'sigCanvas' }}
          />
          <button type="button" onClick={() => handleSignatureClear('participant')}>Clear Signature</button>

          {/* Other sections of the form (Action Taken, Approval, etc.) */}

           <h3>For Office Use Only</h3>
          <div className="action-taken">
            <label>Action Taken:</label>
            <textarea
              name="actionTaken"
              value={formData.actionTaken}
              onChange={handleChange}
            />
          </div>

          <div className="approval">
            <label>Approved By:
              <input
                type="text"
                name="approvedBy"
                value={formData.approvedBy}
                onChange={handleChange}
              />
            </label>
            <label>Title:
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </label>
            <label>Date:
              <input
                type="date"
                name="approvalDate"
                value={formData.approvalDate}
                onChange={handleChange}
              />
            </label>
          </div>
          
       </section>
        <button type="submit">Submit</button>
      </form>
     </div>  
)}  
export default App;