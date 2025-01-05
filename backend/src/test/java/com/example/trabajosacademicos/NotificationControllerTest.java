package com.example.trabajosacademicos;

import com.example.trabajosacademicos.dtos.NotificationDTO;
import com.example.trabajosacademicos.dtos.UserDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class NotificationControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	private UserDTO sender;
	private UserDTO receiver;
	@BeforeEach
	public void setup() throws Exception {
		sender = new UserDTO();
		sender.setId(1L);
		sender.setFirstName("John");
		sender.setLastName("Doe");
		sender.setEmail("sender@example.com");
		sender.setRole("STUDENT");
		sender.setPassword("Password@123");
		sender.setPlace("New York");
		sender.setBirthdate(LocalDate.of(1990, 1, 1));
		sender.setPhoneNumber(681567567);

		receiver = new UserDTO();
		receiver.setId(2L);
		receiver.setFirstName("Jane");
		receiver.setLastName("Smith");
		receiver.setEmail("receiver@example.com");
		receiver.setRole("STUDENT");
		receiver.setPassword("Password@123");
		receiver.setPlace("Los Angeles");
		receiver.setBirthdate(LocalDate.of(1992, 2, 2));
		receiver.setPhoneNumber(682567567);

		mockMvc.perform(post("/api/users")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(sender)));

		mockMvc.perform(post("/api/users")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(receiver)));
	}

	@Test
	@Order(1)
	public void testSendNotificationSuccessful() throws Exception {
		NotificationDTO notification = new NotificationDTO();
		notification.setType("Type");
		notification.setReceiver("receiver@example.com");
		notification.setSender("sender@example.com");
		notification.setTitleTeam("Job");
		notification.setDate(LocalDateTime.now());

		mockMvc.perform(post("/api/notifications/push")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(notification)))
				.andExpect(status().isOk())
				.andExpect(content().string("Notification saved successfully"));

		NotificationDTO notification2 = new NotificationDTO();
		notification2.setType("Type");
		notification2.setReceiver("sender@example.com");
		notification2.setSender("receiver@example.com");
		notification2.setTitleTeam("Job2");
		notification2.setDate(LocalDateTime.now());

		mockMvc.perform(post("/api/notifications/push")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(notification2)))
				.andExpect(status().isOk())
				.andExpect(content().string("Notification saved successfully"));
	}

	@Test
	@Order(2)
	public void testGetNotificationSuccessful() throws Exception {
		mockMvc.perform(get("/api/notifications/receiver@example.com/hidden"))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$").isArray())
				.andExpect(jsonPath("$.length()").value(0));

		mockMvc.perform(get("/api/notifications/receiver@example.com/notHidden"))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$").isArray())
				.andExpect(jsonPath("$.length()").value(1));

		mockMvc.perform(get("/api/notifications/sender@example.com/notSeen"))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$").isArray())
				.andExpect(jsonPath("$.length()").value(1));
	}

	@Test
	@Order(3)
	public void testMarkNotificationSuccessful() throws Exception {
		mockMvc.perform(put("/api/notifications/1/markRead"))
				.andExpect(status().isOk());

		mockMvc.perform(get("/api/notifications/receiver@example.com/notSeen"))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$").isArray())
				.andExpect(jsonPath("$.length()").value(0));

		mockMvc.perform(put("/api/notifications/2/markHidden"))
				.andExpect(status().isOk());

		mockMvc.perform(get("/api/notifications/sender@example.com/hidden"))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$").isArray())
				.andExpect(jsonPath("$.length()").value(1));

		mockMvc.perform(get("/api/notifications/sender@example.com/notHidden"))
				.andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$").isArray())
				.andExpect(jsonPath("$.length()").value(0));
	}

	@Test
	public void testMarkNotificationAsReadNotFound() throws Exception {
		mockMvc.perform(put("/api/notifications/9/markRead")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testMarkNotificationAsHiddenNotFound() throws Exception {
		mockMvc.perform(put("/api/notifications/9/markHidden")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testGetHiddenNotificationsNotFound() throws Exception {
		mockMvc.perform(get("/api/notifications/nonexistent@example.com/hidden")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testGetNotHiddenNotificationsNotFound() throws Exception {
		mockMvc.perform(get("/api/notifications/nonexistent@example.com/notHidden")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testGetNotSeenNotificationsNotFound() throws Exception {
		mockMvc.perform(get("/api/notifications/nonexistent@example.com/notSeen")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testDeleteBySenderAndReceiverSuccessful() throws Exception {
		NotificationDTO notification = new NotificationDTO();
		notification.setType("FRIENDSHIP");
		notification.setReceiver("receiver@example.com");
		notification.setSender("sender@example.com");
		notification.setTitleTeam("Job");
		notification.setDate(LocalDateTime.now());

		mockMvc.perform(post("/api/notifications/push")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(notification)))
				.andExpect(status().isOk())
				.andExpect(content().string("Notification saved successfully"));

		mockMvc.perform(delete("/api/notifications/deleteNotification")
						.contentType(MediaType.APPLICATION_JSON)
						.param("sender", "sender@example.com")
						.param("receiver", "receiver@example.com"))
				.andExpect(status().isOk());
	}

	@Test
	public void testDeleteBySenderAndReceiverNotFound() throws Exception {
		mockMvc.perform(delete("/api/notifications/deleteNotification")
						.contentType(MediaType.APPLICATION_JSON)
						.param("sender", "nonexistent@example.com")
						.param("receiver", "nonexistent@example.com"))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testDeleteBySenderAndTitleSuccessful() throws Exception {
		NotificationDTO notification = new NotificationDTO();
		notification.setType("INQUIRIES");
		notification.setReceiver("receiver@example.com");
		notification.setSender("sender@example.com");
		notification.setTitleTeam("Job");
		notification.setDate(LocalDateTime.now());

		mockMvc.perform(post("/api/notifications/push")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(notification)))
				.andExpect(status().isOk())
				.andExpect(content().string("Notification saved successfully"));

		mockMvc.perform(delete("/api/notifications/Job/deleteNotification")
						.contentType(MediaType.APPLICATION_JSON)
						.param("sender", "sender@example.com"))
				.andExpect(status().isOk());
	}

	@Test
	public void testDeleteBySenderAndTitleNotFound() throws Exception {
		mockMvc.perform(delete("/api/notifications/notExist/deleteNotification")
						.contentType(MediaType.APPLICATION_JSON)
						.param("sender", "nonexistent@example.com"))
				.andExpect(status().isNotFound());
	}
}
