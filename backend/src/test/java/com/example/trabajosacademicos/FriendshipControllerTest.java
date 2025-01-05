package com.example.trabajosacademicos;

import com.example.trabajosacademicos.dtos.FriendshipDTO;
import com.example.trabajosacademicos.dtos.UserDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.greaterThan;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class FriendshipControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	private UserDTO sender;

	private UserDTO receiver;

	private FriendshipDTO friendshipDTO;

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

		friendshipDTO = new FriendshipDTO();
		friendshipDTO.setSenderEmail("sender@example.com");
		friendshipDTO.setReceiverEmail("receiver@example.com");
	}

	@Test
	@Order(1)
	public void testSendFriendshipRequestSuccessful() throws Exception {
		mockMvc.perform(post("/api/friendships/send")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(friendshipDTO)))
				.andExpect(status().isOk())
				.andExpect(content().string("Friendship request sent successfully"));
	}

	@Test
	@Order(2)
	public void testSendFriendshipRequestAlreadySent() throws Exception {
		mockMvc.perform(post("/api/friendships/send")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(friendshipDTO)))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("You have already sent him a request"));
	}

	@Test
	@Order(6)
	public void testSendFriendshipRequestAlreadyFriends() throws Exception {
		mockMvc.perform(post("/api/friendships/send")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(friendshipDTO)))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("You are already friends"));
	}

	@Test
	@Order(3)
	public void testGetFriendshipRequestSuccessful() throws Exception {
		mockMvc.perform(get("/api/friendships/received")
						.contentType(MediaType.APPLICATION_JSON)
						.param("receiverEmail", "receiver@example.com"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.size()").value(1))
				.andExpect(jsonPath("$[0].senderEmail").value("sender@example.com"));

		mockMvc.perform(get("/api/friendships/sent")
						.contentType(MediaType.APPLICATION_JSON)
						.param("senderEmail", "sender@example.com"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.size()").value(1))
				.andExpect(jsonPath("$[0].receiverEmail").value("receiver@example.com"));
	}

	@Test
	public void testGetFriendshipRequestUserNotFound() throws Exception {
		mockMvc.perform(get("/api/friendships/received")
						.contentType(MediaType.APPLICATION_JSON)
						.param("receiverEmail", "notFound@example.com"))
				.andExpect(status().isNotFound());

		mockMvc.perform(get("/api/friendships/sent")
						.contentType(MediaType.APPLICATION_JSON)
						.param("senderEmail", "notFound@example.com"))
				.andExpect(status().isNotFound());
	}

	@Test
	@Order(4)
	public void testCancelFriendshipRequestSuccessful() throws Exception {
		mockMvc.perform(delete("/api/friendships/cancel")
						.contentType(MediaType.APPLICATION_JSON)
						.param("requestEmail", "sender@example.com")
						.param("receiverEmail", "receiver@example.com"))
				.andExpect(status().isOk())
				.andExpect(content().string("Friendship request canceled successfully"));
	}

	@Test
	@Order(5)
	public void testAcceptFriendshipRequestSuccessful() throws Exception {
		mockMvc.perform(post("/api/friendships/send")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(friendshipDTO)))
				.andExpect(status().isOk())
				.andExpect(content().string("Friendship request sent successfully"));

		mockMvc.perform(post("/api/friendships/accept")
						.contentType(MediaType.APPLICATION_JSON)
						.param("requestEmail", "sender@example.com")
						.param("receiverEmail", "receiver@example.com"))
				.andExpect(status().isOk())
				.andExpect(content().string("Friendship request accepted successfully"));

		mockMvc.perform(get("/api/users/sender@example.com/friends")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()", greaterThan(0)));
	}

	@Test
	@Order(7)
	public void testRemoveFriendSuccessful() throws Exception {
		mockMvc.perform(delete("/api/users/remove")
						.contentType(MediaType.APPLICATION_JSON)
						.param("userEmail", "sender@example.com")
						.param("deleteEmail", "receiver@example.com"))
				.andExpect(status().isOk())
				.andExpect(content().string("Friend removed successfully"));

		mockMvc.perform(get("/api/users/sender@example.com/friends")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()", equalTo(0)));
	}

	@Test
	public void testGetUserFriendsUserNotFound() throws Exception {
		mockMvc.perform(get("/api/users/notExist@example.com/friends")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound())
				.andExpect(content().string("Failed to get friends"));
	}

	@Test
	public void testRemoveFriendUserNotFound() throws Exception {
		mockMvc.perform(delete("/api/users/remove")
						.contentType(MediaType.APPLICATION_JSON)
						.param("userEmail", "notExist@example.com")
						.param("deleteEmail", "notExist@example.com"))
				.andExpect(status().isNotFound())
				.andExpect(content().string("Failed to remove friend"));
	}

	@Test
	public void testGetSentFriendshipRequestsNotFound() throws Exception {
		mockMvc.perform(get("/api/friendships/sent")
						.contentType(MediaType.APPLICATION_JSON)
						.param("senderEmail", "notExist@example.com"))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testGetReceivedFriendshipRequestsNotFound() throws Exception {
		mockMvc.perform(get("/api/friendships/received")
						.contentType(MediaType.APPLICATION_JSON)
						.param("receiverEmail", "notExist@example.com"))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testAcceptFriendshipRequestNotFound() throws Exception {
		String requestEmail = "notExist@example.com";
		String receiverEmail = "notExist@example.com";

		mockMvc.perform(post("/api/friendships/accept")
						.contentType(MediaType.APPLICATION_JSON)
						.param("requestEmail", requestEmail)
						.param("receiverEmail", receiverEmail))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("Failed to accept friendship request"));
	}

	@Test
	public void testCancelFriendshipRequestNotFound() throws Exception {
		String requestEmail = "notExist@example.com";
		String receiverEmail = "notExist@example.com";

		mockMvc.perform(delete("/api/friendships/cancel")
						.contentType(MediaType.APPLICATION_JSON)
						.param("requestEmail", requestEmail)
						.param("receiverEmail", receiverEmail))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("Failed to cancel friendship request"));
	}
}
