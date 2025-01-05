package com.example.trabajosacademicos;

import com.example.trabajosacademicos.dtos.JobDTO;
import com.example.trabajosacademicos.dtos.UserDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class JobControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	private UserDTO userDTO;

	private UserDTO user2DTO;

	private UserDTO user3DTO;

	private UserDTO user4DTO;

	private UserDTO user5DTO;

	private JobDTO jobDTO;

	@BeforeEach
	public void setup() throws Exception {
		userDTO = new UserDTO();
		userDTO.setId(1L);
		userDTO.setFirstName("John");
		userDTO.setLastName("Doe");
		userDTO.setEmail("prueba@gmail.com");
		userDTO.setRole("TEACHER");
		userDTO.setPassword("Password@123");
		userDTO.setPlace("New York");
		userDTO.setBirthdate(LocalDate.of(1990, 1, 1));
		userDTO.setPhoneNumber(681567567);

		user2DTO = new UserDTO();
		user2DTO.setId(2L);
		user2DTO.setFirstName("John");
		user2DTO.setLastName("Doe");
		user2DTO.setEmail("john@gmail.com");
		user2DTO.setRole("TEACHER");
		user2DTO.setPassword("Password@123");
		user2DTO.setPlace("New York");
		user2DTO.setBirthdate(LocalDate.of(1990, 1, 1));
		user2DTO.setPhoneNumber(681567567);

		user3DTO = new UserDTO();
		user3DTO.setId(3L);
		user3DTO.setFirstName("John");
		user3DTO.setLastName("Doe");
		user3DTO.setEmail("mike@gmail.com");
		user3DTO.setRole("STUDENT");
		user3DTO.setPassword("Password@123");
		user3DTO.setPlace("New York");
		user3DTO.setBirthdate(LocalDate.of(1990, 1, 1));
		user3DTO.setPhoneNumber(681567567);

		user4DTO = new UserDTO();
		user4DTO.setId(4L);
		user4DTO.setFirstName("John");
		user4DTO.setLastName("Doe");
		user4DTO.setEmail("phil@gmail.com");
		user4DTO.setRole("TEACHER");
		user4DTO.setPassword("Password@123");
		user4DTO.setPlace("New York");
		user4DTO.setBirthdate(LocalDate.of(1990, 1, 1));
		user4DTO.setPhoneNumber(681567567);

		user5DTO = new UserDTO();
		user5DTO.setId(5L);
		user5DTO.setFirstName("John");
		user5DTO.setLastName("Doe");
		user5DTO.setEmail("megan@gmail.com");
		user5DTO.setRole("STUDENT");
		user5DTO.setPassword("Password@123");
		user5DTO.setPlace("New York");
		user5DTO.setBirthdate(LocalDate.of(1990, 1, 1));
		user5DTO.setPhoneNumber(681567567);

		mockMvc.perform(post("/api/users")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(userDTO)));

		mockMvc.perform(post("/api/users")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(user2DTO)));

		mockMvc.perform(post("/api/users")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(user3DTO)));

		mockMvc.perform(post("/api/users")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(user4DTO)));

		mockMvc.perform(post("/api/users")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(user5DTO)));

		jobDTO = new JobDTO();
		jobDTO.setId(2L);
		jobDTO.setCreator("prueba@gmail.com");
		jobDTO.setTitle("FirstJob");
		jobDTO.setDescription("FirstJob Description");
		jobDTO.setRelatedSubject("Math");
		jobDTO.setDeadlineDateTime(LocalDateTime.now().plusDays(1));
	}

	@Test
	@Order(1)
	public void testRegisterJobSuccessful() throws Exception {
		mockMvc.perform(post("/api/jobs")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(jobDTO)))
				.andExpect(status().isOk())
				.andExpect(content().string("Job saved successfully"));
	}

	@Test
	public void testRegisterJobExceptionStudent() throws Exception {
		jobDTO.setCreator("mike@gmail.com");

		mockMvc.perform(post("/api/jobs")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(jobDTO)))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("Only for teachers"));
	}

	@Test
	@Order(2)
	public void testRegisterJobExceptionJob() throws Exception {
		jobDTO.setTitle("FirstJob");

		mockMvc.perform(post("/api/jobs")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(jobDTO)))
				.andExpect(status().isBadRequest());
	}

	@Test
	public void testRegisterJobUserNotFound() throws Exception {
		jobDTO.setCreator("notExist@gmail.com");

		mockMvc.perform(post("/api/jobs")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(jobDTO)))
				.andExpect(status().isNotFound())
				.andExpect(content().string("User not exist"));
	}

	@Test
	public void testGetJobsSuccessful() throws Exception {
		mockMvc.perform(get("/api/jobs/prueba@gmail.com/job-relations")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].name").value("FirstJob"))
				.andExpect(jsonPath("$[0].role").value("ADMIN"));
	}

	@Test
	public void testGetJobsJobUserNotFound() throws Exception {
		mockMvc.perform(get("/api/jobs/notFound@gmail.com/job-relations")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testGetJobByTitleSuccessful() throws Exception {
		mockMvc.perform(get("/api/jobs/FirstJob/job")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.title").value("FirstJob"))
				.andExpect(jsonPath("$.creator").value("prueba@gmail.com"));
	}

	@Test
	public void testGetJobByTitleNotFound() throws Exception {
		mockMvc.perform(get("/api/jobs/notFound/job")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testUpdateVisibilitySuccessful() throws Exception {
		MvcResult result = mockMvc.perform(get("/api/jobs/FirstJob/job")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.title").value("FirstJob"))
				.andExpect(jsonPath("$.creator").value("prueba@gmail.com"))
				.andReturn();

		String jsonResponse = result.getResponse().getContentAsString();
		Integer id = JsonPath.parse(jsonResponse).read("$.id", Integer.class);

		mockMvc.perform(put("/api/jobs/" + id + "/visibility")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(content().string("Job visibility updated"));
	}

	@Test
	public void testUpdateVisibilityNotFound() throws Exception {
		mockMvc.perform(put("/api/jobs/8/visibility")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testIsMemberSuccessfulTrue() throws Exception {
		mockMvc.perform(get("/api/jobs/isMember")
						.param("jobTitle", "FirstJob")
						.param("userEmail", "prueba@gmail.com")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(content().string("true"));
	}

	@Test
	public void testIsMemberSuccessfulFalse() throws Exception {
		mockMvc.perform(get("/api/jobs/isMember")
						.param("jobTitle", "FirstJob")
						.param("userEmail", "john@gmail.com")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(content().string("false"));
	}

	@Test
	public void testIsMemberTitleNotFound() throws Exception {
		mockMvc.perform(get("/api/jobs/isMember")
						.param("jobTitle", "notFound")
						.param("userEmail", "prueba@gmail.com")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testIsMemberUserNotFound() throws Exception {
		mockMvc.perform(get("/api/jobs/isMember")
						.param("jobTitle", "FirstJob")
						.param("userEmail", "notExist@gmail.com")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testIsAdminSuccessfulTrue() throws Exception {
		mockMvc.perform(get("/api/jobs/isAdmin")
						.param("jobTitle", "FirstJob")
						.param("userEmail", "prueba@gmail.com")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(content().string("true"));
	}

	@Test
	public void testIsAdminSuccessfulFalse() throws Exception {
		mockMvc.perform(get("/api/jobs/isAdmin")
						.param("jobTitle", "FirstJob")
						.param("userEmail", "john@gmail.com")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(content().string("false"));
	}

	@Test
	public void testIsAdminTitleNotFound() throws Exception {
		mockMvc.perform(get("/api/jobs/isAdmin")
						.param("jobTitle", "notFound")
						.param("userEmail", "prueba@gmail.com")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testIsAdminUserNotFound() throws Exception {
		mockMvc.perform(get("/api/jobs/isAdmin")
						.param("jobTitle", "FirstJob")
						.param("userEmail", "notExist@gmail.com")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testGetMembersSuccessful() throws Exception {
		mockMvc.perform(get("/api/jobs/members")
						.param("jobTitle", "FirstJob")
						.param("user", "prueba@gmail.com")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].email").value("prueba@gmail.com"))
				.andExpect(jsonPath("$[0].role").value("TEACHER"));
	}

	@Test
	public void testGetMembersJobNotFound() throws Exception {
		mockMvc.perform(get("/api/jobs/members")
						.param("jobTitle", "notFound")
						.param("user", "prueba@gmail.com")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testGetMembersException() throws Exception {
		mockMvc.perform(get("/api/jobs/members")
						.param("jobTitle", "FirstJob")
						.param("user", "john@gmail.com")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("User is not in the team"));
	}

	@Test
	public void testUpdateJobSuccessful() throws Exception {
		MvcResult result = mockMvc.perform(get("/api/jobs/FirstJob/job")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.title").value("FirstJob"))
				.andExpect(jsonPath("$.creator").value("prueba@gmail.com"))
				.andReturn();

		String jsonResponse = result.getResponse().getContentAsString();
		Integer id = JsonPath.parse(jsonResponse).read("$.id", Integer.class);

		jobDTO.setDescription("New description");
		mockMvc.perform(put("/api/jobs/" + id)
						.contentType(MediaType.APPLICATION_JSON)
						.param("user","prueba@gmail.com")
						.content(objectMapper.writeValueAsString(jobDTO)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.description").value(jobDTO.getDescription()));
	}

	@Test
	public void testUpdateJobNotFound() throws Exception {
		mockMvc.perform(put("/api/jobs/10")
						.contentType(MediaType.APPLICATION_JSON)
						.param("user","prueba@gmail.com")
						.content(objectMapper.writeValueAsString(jobDTO)))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testUpdateJobExceptionUser() throws Exception {
		MvcResult result = mockMvc.perform(get("/api/jobs/FirstJob/job")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.title").value("FirstJob"))
				.andExpect(jsonPath("$.creator").value("prueba@gmail.com"))
				.andReturn();

		String jsonResponse = result.getResponse().getContentAsString();
		Integer id = JsonPath.parse(jsonResponse).read("$.id", Integer.class);

		mockMvc.perform(put("/api/jobs/" + id)
						.contentType(MediaType.APPLICATION_JSON)
						.param("user","john@gmail.com")
						.content(objectMapper.writeValueAsString(jobDTO)))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("User is not admin"));;
	}

	@Test
	@Order(Integer.MAX_VALUE-3)
	public void testChangePermissionsSuccessful() throws Exception {
		mockMvc.perform(put("/api/jobs/FirstJob/permissions")
						.contentType(MediaType.APPLICATION_JSON)
						.param("email","john@gmail.com")
						.param("user","prueba@gmail.com"))
				.andExpect(status().isOk())
				.andExpect(content().string("Permission changed for user with email: " + user2DTO.getEmail()));
	}

	@Test
	public void testChangePermissionsJobNotFound() throws Exception {
		mockMvc.perform(put("/api/jobs/notExist/permissions")
						.contentType(MediaType.APPLICATION_JSON)
						.param("email","john@gmail.com")
						.param("user","prueba@gmail.com"))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testChangePermissionsExceptionUser() throws Exception {
		mockMvc.perform(put("/api/jobs/FirstJob/permissions")
						.contentType(MediaType.APPLICATION_JSON)
						.param("email",user5DTO.getEmail())
						.param("user","prueba@gmail.com"))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("User is not in the team"));
	}

	@Test
	@Order(Integer.MAX_VALUE-2)
	public void testChangePermissionsExceptionUser2() throws Exception {
		mockMvc.perform(put("/api/jobs/FirstJob/permissions")
						.contentType(MediaType.APPLICATION_JSON)
						.param("email",user3DTO.getEmail())
						.param("user","john@gmail.com"))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("User is not admin"));
	}

	@Test
	@Order(Integer.MAX_VALUE-2)
	public void testChangePermissionsExceptionUser3() throws Exception {
		mockMvc.perform(put("/api/jobs/FirstJob/permissions")
						.contentType(MediaType.APPLICATION_JSON)
						.param("email",user4DTO.getEmail())
						.param("user","john@gmail.com"))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("User is not creator"));
	}

	@Test
	@Order(Integer.MAX_VALUE-4)
	public void testAddMemberToTeamSuccessful() throws Exception {
		mockMvc.perform(post("/api/jobs/members")
						.contentType(MediaType.APPLICATION_JSON)
						.param("jobTitle","FirstJob")
						.param("userEmail","john@gmail.com")
						.param("user","prueba@gmail.com"))
				.andExpect(status().isOk())
				.andExpect(content().string("Member added successfully"));
	}

	@Test
	public void testAddMemberToTeamJobNotFound() throws Exception {
		mockMvc.perform(post("/api/jobs/members")
						.contentType(MediaType.APPLICATION_JSON)
						.param("jobTitle","NotExist")
						.param("userEmail","prueba@gmail.com")
						.param("user","prueba@gmail.com"))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testAddMemberToTeamUserNotFound() throws Exception {
		mockMvc.perform(post("/api/jobs/members")
						.contentType(MediaType.APPLICATION_JSON)
						.param("jobTitle","FirstJob")
						.param("userEmail","notExist@gmail.com")
						.param("user","prueba@gmail.com"))
				.andExpect(status().isNotFound());
	}

	@Test
	@Order(Integer.MAX_VALUE-3)
	public void testAddMemberToTeamExceptionLimit() throws Exception {
		mockMvc.perform(post("/api/jobs/members")
						.contentType(MediaType.APPLICATION_JSON)
						.param("jobTitle","FirstJob")
						.param("userEmail","phil@gmail.com")
						.param("user","prueba@gmail.com"))
				.andExpect(status().isOk())
				.andExpect(content().string("Member added successfully"));

		mockMvc.perform(post("/api/jobs/members")
						.contentType(MediaType.APPLICATION_JSON)
						.param("jobTitle","FirstJob")
						.param("userEmail","mike@gmail.com")
						.param("user","prueba@gmail.com"))
				.andExpect(status().isOk())
				.andExpect(content().string("Member added successfully"));

		mockMvc.perform(post("/api/jobs/members")
						.contentType(MediaType.APPLICATION_JSON)
						.param("jobTitle","FirstJob")
						.param("userEmail","megan@gmail.com")
						.param("user","prueba@gmail.com"))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("Job is already completed"));
	}

	@Test
	public void testAddMemberToTeamExceptionInTeam() throws Exception {
		mockMvc.perform(post("/api/jobs/members")
						.contentType(MediaType.APPLICATION_JSON)
						.param("jobTitle","FirstJob")
						.param("userEmail","prueba@gmail.com")
						.param("user","prueba@gmail.com"))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("User is already in the team"));
	}

	@Test
	public void testAddMemberToTeamExceptionRole() throws Exception {
		mockMvc.perform(post("/api/jobs/members")
						.contentType(MediaType.APPLICATION_JSON)
						.param("jobTitle","FirstJob")
						.param("userEmail","john@gmail.com")
						.param("user","john@gmail.com"))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("User is not admin"));
	}

	@Test
	@Order(Integer.MAX_VALUE-1)
	public void testExitTeamSuccessful() throws Exception {
		mockMvc.perform(delete("/api/jobs/FirstJob/exitTeam")
						.contentType(MediaType.APPLICATION_JSON)
						.param("email","john@gmail.com"))
				.andExpect(status().isOk())
				.andExpect(content().string("Member exit successfully"));
	}

	@Test
	public void testExitTeamJobNotFound() throws Exception {
		mockMvc.perform(delete("/api/jobs/notExist/exitTeam")
						.contentType(MediaType.APPLICATION_JSON)
						.param("email","prueba@gmail.com"))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testExitTeamUserNotFound() throws Exception {
		mockMvc.perform(delete("/api/jobs/FirstJob/exitTeam")
						.contentType(MediaType.APPLICATION_JSON)
						.param("email","notExist@gmail.com"))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testExitTeamExceptionNotInTeam() throws Exception {
		mockMvc.perform(delete("/api/jobs/FirstJob/exitTeam")
						.contentType(MediaType.APPLICATION_JSON)
						.param("email","megan@gmail.com"))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("User is not in the team"));
	}

	@Test
	@Order(Integer.MAX_VALUE-1)
	public void testDeleteMemberSuccessful() throws Exception {
		mockMvc.perform(delete("/api/jobs/FirstJob/deleteMember")
						.contentType(MediaType.APPLICATION_JSON)
						.param("email","phil@gmail.com")
						.param("user","prueba@gmail.com"))
				.andExpect(status().isOk())
				.andExpect(content().string("Member deleted successfully"));
	}

	@Test
	public void testDeleteMemberJobNotFound() throws Exception {
		mockMvc.perform(delete("/api/jobs/notExist/deleteMember")
						.contentType(MediaType.APPLICATION_JSON)
						.param("email","mike@gmail.com")
						.param("user","prueba@gmail.com"))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testDeleteMemberUserNotFound() throws Exception {
		mockMvc.perform(delete("/api/jobs/FirstJob/deleteMember")
						.contentType(MediaType.APPLICATION_JSON)
						.param("email","notExist@gmail.com")
						.param("user","prueba@gmail.com"))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testDeleteMemberExceptionUserNotInTeam() throws Exception {
		mockMvc.perform(delete("/api/jobs/FirstJob/deleteMember")
						.contentType(MediaType.APPLICATION_JSON)
						.param("email","megan@gmail.com")
						.param("user","prueba@gmail.com"))
				.andExpect(status().isBadRequest())
				.andExpect(content().string("User is not in the team"));
	}

	@Test
	public void testDeleteMemberExceptionUserActionNotAdmin() throws Exception {
		mockMvc.perform(delete("/api/jobs/FirstJob/deleteMember")
						.contentType(MediaType.APPLICATION_JSON)
						.param("email","prueba@gmail.com")
						.param("user","megan@gmail.com"))
				.andExpect(status().isBadRequest());
	}

	@Test
	public void testDeleteMemberExceptionUserIsAdmin() throws Exception {
		mockMvc.perform(delete("/api/jobs/FirstJob/deleteMember")
						.contentType(MediaType.APPLICATION_JSON)
						.param("email","prueba@gmail.com")
						.param("user","prueba@gmail.com"))
				.andExpect(status().isBadRequest());
	}

	@Test
	@Order(Integer.MAX_VALUE)
	public void testDeleteTeamSuccessful() throws Exception {
		mockMvc.perform(delete("/api/jobs/FirstJob/deleteTeam")
						.contentType(MediaType.APPLICATION_JSON)
						.param("user","prueba@gmail.com"))
				.andExpect(status().isOk())
				.andExpect(content().string("Team deleted successfully"));
	}

	@Test
	public void testDeleteTeamJobNotFound() throws Exception {
		mockMvc.perform(delete("/api/jobs/notExist/deleteTeam")
						.contentType(MediaType.APPLICATION_JSON)
						.param("user","prueba@gmail.com"))
				.andExpect(status().isNotFound());
	}


	@Test
	public void testDeleteTeamExceptionUserActionIsNotCreator() throws Exception {
		mockMvc.perform(delete("/api/jobs/FirstJob/deleteTeam")
						.contentType(MediaType.APPLICATION_JSON)
						.param("user","megan@gmail.com"))
				.andExpect(status().isBadRequest());
	}

}
